
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from io import BytesIO

app = FastAPI(
    title="CarePath AI API",
    description="Smart Patient Care Platform",
    version="1.0.0"
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
