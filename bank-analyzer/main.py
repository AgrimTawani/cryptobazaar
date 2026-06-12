from fastapi import FastAPI, UploadFile, File, HTTPException, Form, BackgroundTasks
import opendataloader_pdf
from pypdf import PdfReader
from pypdf.errors import PdfReadError
import tempfile
import os
import json
import traceback
import boto3
import requests
import analyzer

app = FastAPI(title="Bank Statement Analyzer")

# Initialize R2 client
s3 = boto3.client(
    's3',
    endpoint_url=f"https://{os.environ.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
    aws_access_key_id=os.environ.get('R2_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('R2_SECRET_ACCESS_KEY'),
    region_name='auto'
)
R2_BUCKET_NAME = os.environ.get('R2_BUCKET_NAME')

def process_statement_background(
    file_bytes: bytes,
    expected_name: str,
    account_number: str,
    ifsc_code: str,
    webhook_url: str,
    user_id: str,
    attempt_number: str
):
    try:
        # Save to a temporary file
        temp_pdf_path = ""
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_bytes)
            temp_pdf_path = tmp.name

        # Detect if PDF is locked; also extract raw text for metadata search
        pypdf_text = None
        try:
            reader = PdfReader(temp_pdf_path)
            if reader.is_encrypted:
                requests.post(webhook_url, json={"status": "LOCKED_PDF", "error": "The uploaded PDF is password protected. Please provide an unlocked PDF.", "user_id": user_id})
                return
            pypdf_text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except PdfReadError:
            requests.post(webhook_url, json={"status": "LOCKED_PDF", "error": "The uploaded PDF is password protected or corrupted.", "user_id": user_id})
            return
        except Exception as e:
            requests.post(webhook_url, json={"status": "EXTRACTION_FAILED", "error": f"Failed to read PDF: {str(e)}", "user_id": user_id})
            return

        # Table Extraction Logic with OpenDataLoader
        extracted_data = {}
        with tempfile.TemporaryDirectory() as temp_out_dir:
            try:
                opendataloader_pdf.convert(
                    input_path=temp_pdf_path,
                    output_dir=temp_out_dir,
                    format="json"
                )
                
                # Find the json file in the directory
                for filename in os.listdir(temp_out_dir):
                    if filename.endswith(".json"):
                        with open(os.path.join(temp_out_dir, filename), "r") as f:
                            extracted_data = json.load(f)
                        break
            except Exception as e:
                traceback.print_exc()
                pass
                
        # Verification Logic (Quick pre-check)
        # Use pypdf raw text for header fields (account no, IFSC) — opendataloader
        # only extracts tagged table content and misses the PDF header section.
        if account_number or ifsc_code:
            search_text = pypdf_text or json.dumps(extracted_data)

            if account_number and account_number not in search_text:
                requests.post(webhook_url, json={"status": "VERIFICATION_FAILED", "error": "Bank account number not found in the statement.", "user_id": user_id})
                return

            if ifsc_code and ifsc_code not in search_text:
                requests.post(webhook_url, json={"status": "VERIFICATION_FAILED", "error": "IFSC code not found in the statement.", "user_id": user_id})
                return
        
        # Upload JSON directly to R2
        r2_json_key = f"{user_id}/statements/{attempt_number}/statement.json"
        
        if extracted_data and R2_BUCKET_NAME:
            try:
                s3.put_object(
                    Bucket=R2_BUCKET_NAME,
                    Key=r2_json_key,
                    Body=json.dumps(extracted_data),
                    ContentType='application/json'
                )
            except Exception as e:
                print(f"Failed to upload JSON to R2: {e}")

        # Advanced Analysis & Verification Logic
        analysis_result = analyzer.analyze_bank_statement_json(
            extracted_data,
            expected_name=expected_name,
            expected_account_number=account_number,
            expected_ifsc=ifsc_code,
            pypdf_text=pypdf_text,
        )

        metadata = analysis_result["metadata"]
        calc = analysis_result["metrics"]

        metrics = {
            "user_id": user_id,
            "status": "COMPLETED",
            "r2_json_key": r2_json_key,
            
            "extractedName": metadata["extractedName"],
            "extractedAccountNumber": metadata["extractedAccountNumber"],
            "extractedIfscCode": metadata["extractedIfscCode"],
            "metadataVerificationResult": metadata["verification"],
            
            "hasRegularIncome": calc["hasRegularIncome"],
            "recurringBillCount": calc["recurringBillCount"],
            "transactionModes": calc["transactionModes"],
            "hasMerchantSpend": calc["hasMerchantSpend"],
            "exchangeTxCount": calc["exchangeTxCount"],
            "monthsWithCryptoTrades": calc["monthsWithCryptoTrades"],
            "hasBidirectionalCrypto": calc["hasBidirectionalCrypto"],
            "maxVolumeSpikeRatio": calc["maxVolumeSpikeRatio"],
            "avgUniqueSendersPerMonth": calc["avgUniqueSendersPerMonth"],
            "senderRecurrenceRate": calc["senderRecurrenceRate"],
            "avgCreditToDebitHours": calc["avgCreditToDebitHours"],
            "roundNumberRatio": calc["roundNumberRatio"],
            "structuringClustersCount": calc["structuringClustersCount"],
            "inflowSpikeRatio": calc["inflowSpikeRatio"],
            "avgMonthlyBalance": calc["avgMonthlyBalance"],
            "balanceDropsToZero": calc["balanceDropsToZero"],
            "returnedPaymentsCount": calc["returnedPaymentsCount"],
            "positiveNetFlowMonths": calc["positiveNetFlowMonths"],
        }

        # Send back to Next.js Webhook
        res = requests.post(webhook_url, json=metrics)
        print(f"Webhook response: {res.status_code}")

    except Exception as e:
        traceback.print_exc()
        requests.post(webhook_url, json={"status": "EXTRACTION_FAILED", "error": "An unexpected error occurred during analysis.", "user_id": user_id})
    finally:
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)


@app.post("/analyze")
async def analyze_statement(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    expected_name: str = Form(None),
    account_number: str = Form(None),
    ifsc_code: str = Form(None),
    webhook_url: str = Form(...),
    user_id: str = Form(...),
    attempt_number: str = Form(...)
):
    if not file.filename.endswith(".pdf"):
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
        attempt_number=attempt_number
    )
    
    return {"status": "PROCESSING"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
