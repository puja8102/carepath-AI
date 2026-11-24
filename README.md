# 🏥 CarePath AI

### AI-Powered Smart Patient Care & Blood Connect Platform

**From Medical Documents to Smarter Patient Care.**

CarePath AI is an educational healthcare assistance prototype designed
to organize medical documents, manage medicine inventory, display sample
blood availability, maintain health activity records, and provide
AI-powered educational assistance.

The platform brings these features together in a simple, user-friendly
dashboard.

> **Important:** This is a demonstration prototype. It is not connected
> to real hospitals, blood banks, or healthcare providers. Use fictional
> information only.

------------------------------------------------------------------------

## 🚀 Project Overview

Managing healthcare information can be challenging when medical
documents, medicine records, and other care-related information are
stored separately.

CarePath AI demonstrates how these features can be brought together in
one platform through document processing, inventory management, sample
blood-connect records, and an AI educational assistant.

## ✨ Key Features

### 1. 📄 Medical Document Management

-   Upload medical PDF documents.
-   Extract selectable text from PDF files.
-   Organize extracted medical information.
-   Display basic rule-based insights.

### 2. 💊 Medicine Inventory

-   Add medicine records.
-   Update available quantities.
-   Remove medicine entries.
-   Maintain inventory information.

### 3. 🩸 Blood Availability

-   Display sample blood-group availability.
-   View demonstration stock information.
-   Calculate total sample units.

> Blood availability is fictional demonstration data, not live
> blood-bank stock.

### 4. ❤️ Donor Registration

-   Demonstration donor registration form.
-   Adult-only registration flow (18+).
-   Consent-based submission.
-   Pending verification status.

Actual donor eligibility and registration must be handled by authorized
blood banks.

### 5. 🔄 Blood Request Management

-   Submit demonstration blood requests.
-   Record blood group and requested units.
-   Display request information.

### 6. 🤖 AI Educational Assistant

-   AI-powered educational question-answering.
-   Provides general healthcare-related information.
-   Helps users understand basic medical terms.
-   Uses the Google Gemini API.

The assistant does not diagnose diseases, prescribe medicines, or
provide personal treatment decisions.

### 7. 📅 Health Timeline

-   Displays recorded demo activities.
-   Tracks document and inventory activities.
-   Shows demonstration request and registration events.

------------------------------------------------------------------------

## 🛠️ Technology Stack

  Technology          Purpose
  ------------------- ----------------------------------
  HTML5               Website structure
  CSS3                Styling and responsive interface
  JavaScript          Frontend functionality
  Python              Backend development
  FastAPI             REST API development
  Google Gemini API   AI educational assistant
  PyPDF               PDF text extraction
  Local Storage       Demo data persistence

------------------------------------------------------------------------

## 🏗️ Project Structure

``` text
carepath-AI/
├── index.html
├── style.css
├── script.js
├── .gitignore
└── backend/
    ├── main.py
    ├── main_backup.py
    └── requirements.txt
```

------------------------------------------------------------------------

## ⚙️ Installation and Setup

### Prerequisites

-   Python installed on your system
-   Visual Studio Code
-   Google Gemini API key
-   Live Server extension for VS Code

### Step 1: Clone the Repository

``` bash
git clone https://github.com/puja8102/carepath-AI.git
```

### Step 2: Open the Project

``` bash
cd carepath-AI
```

### Step 3: Create a Virtual Environment

``` bash
cd backend
python -m venv .venv
```

### Step 4: Activate the Environment (Windows)

``` powershell
.\.venv\Scripts\Activate.ps1
```

### Step 5: Install Dependencies

``` bash
pip install -r requirements.txt
```

### Step 6: Configure Environment Variables

Create a `.env` file inside the `backend` folder and add your own Gemini
API key:

``` env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

**Security:** Never upload your `.env` file or API key to GitHub.

### Step 7: Start the Backend

``` bash
python -m uvicorn main:app --reload
```

Backend URL: `http://127.0.0.1:8000`

API documentation: `http://127.0.0.1:8000/docs`

### Step 8: Run the Frontend

Open the project folder in VS Code and run `index.html` using the Live
Server extension.

------------------------------------------------------------------------

## 🔒 Privacy and Safety

-   Use fictional information for demonstrations.
-   Do not upload real patient records.
-   Keep API keys and environment variables private.
-   AI responses are educational and informational only.
-   The platform does not replace qualified healthcare professionals.
-   Sample blood availability is not connected to actual blood banks.

## ⚠️ Current Prototype Limitations

-   No login or user authentication feature.
-   No live hospital or blood-bank integration.
-   Blood availability uses demonstration data.
-   Scanned PDFs requiring OCR are not currently supported.
-   AI responses depend on Gemini API availability and configuration.
-   This prototype is not intended for clinical diagnosis or treatment.

## 🔮 Future Improvements

-   Secure user authentication and role-based access.
-   Integration with verified healthcare services.
-   Real-time blood-bank connectivity through authorized APIs.
-   OCR support for scanned medical documents.
-   Improved document analysis and accessibility.
-   Secure cloud-based data management.

## 🎯 Project Objective

The main objective of CarePath AI is to demonstrate how AI and digital
technologies can help organize healthcare-related information and
simplify basic patient-care workflows.

------------------------------------------------------------------------

## 👩‍💻 Developed By

**Pritam Kumari**

**Project:** CarePath AI\
**Category:** Artificial Intelligence \| Healthcare Technology

## 🙏 Acknowledgement

This project demonstrates the potential of combining web technologies,
Python-based APIs, and generative AI to build an educational healthcare
assistance platform.

**CarePath AI -- Care Better, Stay Healthy, Stay Informed.**

------------------------------------------------------------------------

*Disclaimer: CarePath AI is an educational prototype developed for
demonstration and learning purposes only. It is not a certified medical
application.*
