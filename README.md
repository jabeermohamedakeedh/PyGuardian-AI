# PyGuardian AI

### Analyze Smarter. Code Safer.

PyGuardian AI is a web-based Python code analysis platform that combines traditional static analysis tools with AI-assisted explanations. It helps students, beginner programmers, and developers identify code quality issues, potential security vulnerabilities, and software complexity problems in Python applications.

## Project Overview

PyGuardian AI integrates multiple static analysis tools into a single platform and uses Google Gemini AI to provide understandable explanations and recommendations based on analysis findings.

## Main Features

- **User Authentication:** User registration, login, JWT-based authentication, and email-based password recovery.
- **Python Code Submission:** Upload Python source files or submit code directly.
- **Code Quality Analysis:** Pylint identifies coding standard violations and potential code quality issues.
- **Security Analysis:** Bandit identifies potential security vulnerabilities.
- **Complexity Analysis:** Radon evaluates Python code complexity.
- **AI-Powered Explanations:** Google Gemini AI generates beginner-friendly explanations and recommendations.
- **AI Assistant:** Provides conversational support for Python-related questions.
- **Dashboard:** Displays analysis statistics and results.
- **Analysis History:** Stores and retrieves previous analysis records.
- **Report Export:** Generates downloadable PDF and CSV reports.
- **Administrator Dashboard:** Supports user management, platform analytics, and system health monitoring.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| UI and Styling | Tailwind CSS, Radix UI |
| Backend | Python, FastAPI |
| Database | PostgreSQL, Supabase |
| ORM | SQLAlchemy |
| Static Analysis | Pylint, Bandit, Radon |
| AI Integration | Google Gemini API, Google GenAI SDK |
| Authentication | JWT, Passlib, Bcrypt |
| PDF Reports | jsPDF, jsPDF-AutoTable |
| CSV Export | JavaScript Blob API |

## Project Structure

```text
PyGuardian-AI/
│
├── backend/
│   ├── main.py
│   ├── analysis.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── security.py
│   └── requirements.txt
│
├── src/
│   └── Frontend source code
│
├── guidelines/
├── .env.example
├── package.json
└── README.md
```

## Running the Project

### Frontend

Install the required dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

### Backend

Navigate to the backend directory:

```bash
cd backend
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables using the provided `backend/.env.example` file. Add your own database, Gemini API, JWT, and email configuration locally. Never commit real credentials.

Start the FastAPI backend:

```bash
uvicorn main:app --reload
```

The API documentation can be accessed through the FastAPI Swagger interface at `/docs` when the backend is running.

## Supported Scope

The current implementation focuses on Python source code analysis. It does not provide dynamic runtime analysis, automatic code correction, or native mobile applications.

## Repository

**Project Name:** PyGuardian AI

**Repository:** [PyGuardian-AI](https://github.com/jabeermohamedakeedh/PyGuardian-AI)

## Security Notice

Environment files containing actual API keys, database credentials, JWT secrets, or email passwords must not be committed to the public repository. Use the provided environment example files for configuration guidance.

## Author

Developed as a BSc (Hons) Software Engineering (Top-Up) final-year project.
