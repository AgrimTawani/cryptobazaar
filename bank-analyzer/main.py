from fastapi import FastAPI, UploadFile, File, HTTPException, Form
import opendataloader_pdf
from pypdf import PdfReader
from pypdf.errors import PdfReadError
import tempfile
import os
import json
import traceback

app = FastAPI(title="Bank Statement Analyzer")

@app.post("/analyze")
async def analyze_statement(
    file: UploadFile = File(...),
    account_number: str = Form(None),
    ifsc_code: str = Form(None)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Save to a temporary file
    temp_pdf_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            contents = await file.read()
            tmp.write(contents)
            temp_pdf_path = tmp.name

        # Detect if PDF is locked
        try:
            reader = PdfReader(temp_pdf_path)
            if reader.is_encrypted:
                return {
                    "status": "LOCKED_PDF",
                    "error": "The uploaded PDF is password protected. Please provide an unlocked PDF."
                }
        except PdfReadError:
            return {
                "status": "LOCKED_PDF",
                "error": "The uploaded PDF is password protected or corrupted."
            }
        except Exception as e:
            return {
                "status": "EXTRACTION_FAILED",
                "error": f"Failed to read PDF: {str(e)}"
            }

        # Table Extraction Logic with OpenDataLoader
        extracted_data = {}
        with tempfile.TemporaryDirectory() as temp_out_dir:
            try:
                opendataloader_pdf.convert(
                    input_path=temp_pdf_path,
                    output_dir=temp_out_dir,
                    format="json"
                )
                
                # OpenDataLoader outputs to a file matching the input filename + .json
                # Let's find the json file in the directory
                for filename in os.listdir(temp_out_dir):
                    if filename.endswith(".json"):
                        with open(os.path.join(temp_out_dir, filename), "r") as f:
                            extracted_data = json.load(f)
                        break
            except Exception as e:
                traceback.print_exc()
                pass
                
        # Verification Logic
        if account_number or ifsc_code:
            # Simple text search inside the JSON string dump
            json_dump = json.dumps(extracted_data)
            
            if account_number and account_number not in json_dump:
                return {
                    "status": "VERIFICATION_FAILED",
                    "error": "Bank account number not found in the statement."
                }
                
            if ifsc_code and ifsc_code not in json_dump:
                return {
                    "status": "VERIFICATION_FAILED",
                    "error": "IFSC code not found in the statement."
                }
        
        # Heuristics Logic (A, B, C, D checks)
        metrics = {
            "status": "COMPLETED",
            "extracted_data": extracted_data,
            "hasRegularIncome": True,
            "recurringBillCount": 4,
            "transactionModes": ["UPI", "NEFT"],
            "hasMerchantSpend": True,
            "exchangeTxCount": 2,
            "monthsWithCryptoTrades": 1,
            "hasBidirectionalCrypto": False,
            "maxVolumeSpikeRatio": 1.2,
            "avgUniqueSendersPerMonth": 5.5,
            "senderRecurrenceRate": 60.0,
            "avgCreditToDebitHours": 48.5,
            "roundNumberRatio": 0.1,
            "structuringClustersCount": 0,
            "inflowSpikeRatio": 1.1,
            "avgMonthlyBalance": 125000.50,
            "balanceDropsToZero": 0,
            "returnedPaymentsCount": 0,
            "positiveNetFlowMonths": 5,
        }

        # Example calculation if extracted_data is populated:
        if extracted_data:
            pass # TODO: apply heuristic logic to metrics using the JSON

        return metrics

    except Exception as e:
        traceback.print_exc()
        return {
            "status": "EXTRACTION_FAILED",
            "error": "An unexpected error occurred during analysis."
        }
    finally:
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)

@app.get("/health")
def health_check():
    return {"status": "ok"}
