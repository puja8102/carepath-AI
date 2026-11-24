
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from io import BytesIO
import re
import os
from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
app = FastAPI(
    title="CarePath AI API",
    description="Smart Patient Care Platform",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "CarePath AI Backend is running!",
        "status": "success"
    }

@app.get("/api/health")
def health_check():
    return {
        "project": "CarePath AI",
        "backend": "Active",
        "status": "Healthy"
    }

def analyze_document_text(text):
    test_names = [
        "Hemoglobin",
        "White Blood Cell",
        "WBC Count",
        "Platelet Count",
        "Red Blood Cell",
        "RBC Count",
        "Blood Glucose",
        "Cholesterol",
        "Creatinine",
        "Urea",
        "TSH"
    ]

    medical_terms = [
        "Complete Blood Count",
        "CBC",
        "Hemoglobin",
        "Platelet",
        "White Blood Cell",
        "Red Blood Cell",
        "Glucose",
        "Cholesterol",
        "Creatinine"
    ]

    identified_tests = [
        item for item in test_names
        if item.lower() in text.lower()
    ]

    identified_terms = [
        item for item in medical_terms
        if item.lower() in text.lower()
    ]

    dates = re.findall(
        r'\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|'
        r'\d{1,2}\s+[A-Za-z]+\s+\d{4}|'
        r'\d{4}-\d{2}-\d{2})\b',
        text
    )

    return {
        "document_summary": (
            "Document text processed successfully. "
            "Identified details are listed below."
        ),
        "identified_tests": identified_tests,
        "identified_medical_terms": identified_terms,
        "identified_dates": list(dict.fromkeys(dates)),
        "notice": (
            "This is rule-based text identification, "
            "not AI interpretation or medical advice. "
            "Verify details against the original report."
        )
    }

@app.post("/api/documents/extract")
async def extract_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file."
        )

    content = await file.read()

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="PDF size must be 10 MB or less."
        )

    try:
        reader = PdfReader(BytesIO(content))

        if reader.is_encrypted:
            raise HTTPException(
                status_code=400,
                detail="Password-protected PDFs are not supported."
            )

        extracted_text = "\n".join(
            page.extract_text() or ""
            for page in reader.pages
        )

        if not extracted_text.strip():
            raise HTTPException(
                status_code=422,
                detail="No readable text found. Scanned PDFs need OCR."
            )

        return {
            "filename": file.filename,
            "total_pages": len(reader.pages),
            "extracted_text": extracted_text,
            "message": "PDF text extracted successfully."
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read this PDF file."
        )
    finally:
        await file.close()

@app.post("/api/documents/analyze")
async def analyze_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file."
        )

    content = await file.read()

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="PDF size must be 10 MB or less."
        )

    try:
        reader = PdfReader(BytesIO(content))

        if reader.is_encrypted:
            raise HTTPException(
                status_code=400,
                detail="Password-protected PDFs are not supported."
            )

        extracted_text = "\n".join(
            page.extract_text() or ""
            for page in reader.pages
        )

        if not extracted_text.strip():
            raise HTTPException(
                status_code=422,
                detail="No readable text found. Scanned PDFs need OCR."
            )

        result = analyze_document_text(extracted_text)

        return {
            "filename": file.filename,
            "total_pages": len(reader.pages),
            "analysis": result,
            "message": "Document insights generated successfully."
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not analyze this PDF file."
        )
    finally:
        await file.close()

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


@app.post("/api/chat")
def chat_assistant(request: ChatRequest):
    if not client:
        return {
            "answer": "CarePath AI demo assistant is active. Please ask a general health education question."
        }

    prompt = (
        "You are CarePath AI, an educational patient-care assistant. "
        "Give short, simple and general information. "
        "Never diagnose diseases, prescribe medicines, or recommend doses. "
        "Do not interpret medical reports as a diagnosis. "
        "For personal or urgent medical concerns, recommend contacting "
        "a qualified healthcare professional. "
        "Do not ask for personal health information. "
        "This is a demo application, not a real hospital service.\n\n"
        f"User message: {request.message}"
    )

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )

        answer = response.text or "Please try asking again."
        return {"answer": answer}

    except Exception as error:
        print("Gemini API Error:", repr(error))

        return {
            "answer": (
                "CarePath AI Demo Assistant: The live AI service is "
                "temporarily unavailable. This demo can provide general "
                "educational information. Please try again later."
            )
        }
