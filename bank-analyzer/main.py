"""
main.py — FastAPI microservice for bank statement analysis.

Endpoint: POST /analyze-statement
  - Accepts PDF bank statement + user identity fields
  - Extracts text with pdfplumber
  - Uploads PDF, raw text, and analysis JSON to Cloudflare R2
  - Runs 19-check analysis pipeline
  - Sends results to frontend webhook
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, BackgroundTasks
import tempfile
import os
import json
import traceback
import boto3
import requests

import extractor
import analyzer

app = FastAPI(title="Bank Statement Analyzer")

# ─── R2 Client Setup (Lazy) ───────────────────────────────────────────────────

_s3_client = None
R2_BUCKET_NAME = os.environ.get('R2_BUCKET_NAME')


def _get_s3():
    """Lazily initialize the S3/R2 client to avoid startup failures when env vars are missing."""
    global _s3_client
    if _s3_client is None:
        endpoint = os.environ.get('R2_ENDPOINT_URL')
        if not endpoint:
            account_id = os.environ.get('R2_ACCOUNT_ID', '')
            if account_id:
                endpoint = f"https://{account_id}.r2.cloudflarestorage.com"
        _s3_client = boto3.client(
            's3',
            endpoint_url=endpoint,
            aws_access_key_id=os.environ.get('R2_ACCESS_KEY_ID'),
            aws_secret_access_key=os.environ.get('R2_SECRET_ACCESS_KEY'),
            region_name='auto',
        )
    return _s3_client


# ─── R2 Upload Helpers ───────────────────────────────────────────────────────

def upload_to_r2(key: str, body, content_type: str = 'application/octet-stream'):
    """Upload a file to Cloudflare R2."""
    if not R2_BUCKET_NAME:
        print("[R2] Bucket name not configured, skipping upload")
        return
    try:
        _get_s3().put_object(
            Bucket=R2_BUCKET_NAME,
            Key=key,
            Body=body,
            ContentType=content_type,
        )
        print(f"[R2] Uploaded: {key}")
    except Exception as e:
        print(f"[R2] Failed to upload {key}: {e}")


# ─── Background Processing ───────────────────────────────────────────────────

def process_statement_background(
    file_bytes: bytes,
    expected_name: str,
    account_number: str,
    ifsc_code: str,
    webhook_url: str,
    user_id: str,
    attempt_number: str,
):
    temp_pdf_path = ""
    try:
        # 1. Save PDF to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_bytes)
            temp_pdf_path = tmp.name

        # 2. Extract using pdfplumber pipeline
        try:
            result = extractor.extract_from_pdf(temp_pdf_path)
        except Exception as e:
            traceback.print_exc()
            requests.post(webhook_url, json={
                "status": "EXTRACTION_FAILED",
                "error": f"Failed to extract PDF content: {str(e)}",
                "user_id": user_id,
            })
            return

        raw_text = result["raw_text"]
        metadata = result["metadata"]
        df = result["transactions"]

        # 3. Check for locked/empty PDFs
        if not raw_text or len(raw_text.strip()) < 50:
            requests.post(webhook_url, json={
                "status": "EXTRACTION_FAILED",
                "error": "The PDF appears to be empty, password-protected, or image-based. Please upload a text-based bank statement.",
                "user_id": user_id,
            })
            return

        # 4. Upload artifacts to R2
        base_key = f"{user_id}/statements/{attempt_number}"

        # Original PDF
        upload_to_r2(f"{base_key}/statement.pdf", file_bytes, 'application/pdf')

        # Extracted raw text
        upload_to_r2(f"{base_key}/statement.txt", raw_text.encode('utf-8'), 'text/plain')

        # 5. Quick verification — check if account number / IFSC exist in text
        if account_number and account_number not in raw_text:
            requests.post(webhook_url, json={
                "status": "VERIFICATION_FAILED",
                "error": "Bank account number not found in the statement.",
                "user_id": user_id,
            })
            return

        if ifsc_code and ifsc_code.upper() not in raw_text.upper():
            requests.post(webhook_url, json={
                "status": "VERIFICATION_FAILED",
                "error": "IFSC code not found in the statement.",
                "user_id": user_id,
            })
            return

        # 6. Identity verification
        verification = analyzer.verify_identity(
            raw_text, metadata,
            user_name=expected_name,
            user_account_number=account_number,
            user_ifsc=ifsc_code,
        )

        # 7. Run all 19 analysis checks
        checks = analyzer.run_all_checks(df)

        # 8. Convert to flat metrics for backward compatibility with webhook/DB
        flat_metrics = analyzer.checks_to_flat_metrics(checks)

        # 9. Build complete analysis result
        analysis_json = {
            "user_id": user_id,
            "status": "COMPLETED",
            "metadata": verification,
            "checks": [c for c in checks],  # Full structured check results
            "summary": {
                "total_checks": len(checks),
                "passed": sum(1 for c in checks if c["passed"]),
                "failed": sum(1 for c in checks if not c["passed"]),
                "pass_rate": round(sum(1 for c in checks if c["passed"]) / len(checks) * 100, 1) if checks else 0,
            }
        }

        # 10. Upload analysis JSON to R2
        r2_json_key = f"{base_key}/analysis.json"
        upload_to_r2(r2_json_key, json.dumps(analysis_json, indent=2, default=str), 'application/json')

        # 11. Build webhook payload (flat format for DB compatibility)
        webhook_payload = {
            "user_id": user_id,
            "status": "COMPLETED",
            "r2_json_key": r2_json_key,

            # Verification fields
            "extractedName": verification["extractedName"],
            "extractedAccountNumber": verification["extractedAccountNumber"],
            "extractedIfscCode": verification["extractedIfscCode"],
            "metadataVerificationResult": verification["verification"],

            # All 19 flat metrics
            **flat_metrics,
        }

        # 12. Send to frontend webhook
        res = requests.post(webhook_url, json=webhook_payload)
        print(f"[Webhook] Response: {res.status_code}")

    except Exception as e:
        traceback.print_exc()
        try:
            requests.post(webhook_url, json={
                "status": "EXTRACTION_FAILED",
                "error": "An unexpected error occurred during analysis.",
                "user_id": user_id,
            })
        except Exception:
            pass
    finally:
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)


# ─── API Endpoints ────────────────────────────────────────────────────────────

@app.post("/analyze-statement")
async def analyze_statement(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    expected_name: str = Form(None),
    account_number: str = Form(None),
    ifsc_code: str = Form(None),
    webhook_url: str = Form(...),
    user_id: str = Form(...),
    attempt_number: str = Form(...),
):
    """
    Main endpoint — accepts a PDF bank statement and runs the full
    extraction + analysis pipeline in the background.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    contents = await file.read()

    background_tasks.add_task(
        process_statement_background,
        file_bytes=contents,
        expected_name=expected_name,
        account_number=account_number,
        ifsc_code=ifsc_code,
        webhook_url=webhook_url,
        user_id=user_id,
        attempt_number=attempt_number,
    )

    return {"status": "PROCESSING"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
