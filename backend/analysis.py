import tempfile
import subprocess
import os
import json
import sys
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types
import schemas

# Load environment variables from .env file
load_dotenv()

# Read the API key from the environment (set in backend/.env)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Dictionary of beginner-friendly fixes for common Pylint/Bandit issues
QUICK_FIXES = {
    "missing-module-docstring": 'Add a triple-quoted string at the very top of your file. Example: """This script does XYZ."""',
    "missing-function-docstring": 'Add a triple-quoted string right under the `def` line. Example: """Calculates the total."""',
    "missing-class-docstring": 'Add a triple-quoted string right under the `class` line to explain what the class is for.',
    "missing-final-newline": 'Go to the very end of your file and press Enter once to add an empty line.',
    "line-too-long": "This line is too long to easily read. Try splitting it into multiple lines using parentheses or backslashes.",
    "invalid-name": "Python prefers 'snake_case' (e.g., my_variable) for variables and functions, and 'PascalCase' (e.g., MyClass) for classes.",
    "unused-import": "You imported a module but never used it. Delete the import line to keep your code clean.",
    "redefined-outer-name": "You named a variable inside a function the exact same thing as a global variable outside. Pick a new name.",
    "B104": "Binding to '0.0.0.0' allows anyone to access this server. Change it to '127.0.0.1' (localhost) if it's meant to be private.",
    "B105": "Never type passwords directly in your code. Use environment variables (like os.getenv('PASSWORD')) instead.",
    "B106": "Never type passwords directly in your code. Use environment variables (like os.getenv('PASSWORD')) instead.",
    "B303": "You are using an MD5 hash, which is weak and easily cracked. Use SHA-256 (hashlib.sha256) instead.",
    "B311": "Using 'random' is not safe for generating passwords or tokens. Use the 'secrets' module instead."
}

# Use sys.executable so we always call the same Python that is running uvicorn.
# This works even if the .exe launchers are broken due to a folder rename.
_PYTHON = sys.executable

def run_pylint(filepath: str) -> str:
    """Run pylint via the current Python interpreter's -m flag with a 30-second timeout."""
    try:
        result = subprocess.run(
            [_PYTHON, "-m", "pylint", filepath, "--output-format=json"],
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.stdout
    except subprocess.TimeoutExpired:
        print(f"[TIMEOUT] Pylint timed out after 30 seconds on {filepath}")
        return json.dumps({"error": "Pylint static quality analysis timed out after 30 seconds."})
    except Exception as e:
        print(f"Pylint error: {e}")
        return ""

def run_bandit(filepath: str) -> str:
    """Run bandit via the current Python interpreter's -m flag with a 30-second timeout."""
    try:
        result = subprocess.run(
            [_PYTHON, "-m", "bandit", "-f", "json", filepath],
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.stdout
    except subprocess.TimeoutExpired:
        print(f"[TIMEOUT] Bandit timed out after 30 seconds on {filepath}")
        return json.dumps({"error": "Bandit security scan timed out after 30 seconds."})
    except Exception as e:
        print(f"Bandit error: {e}")
        return ""

def run_radon(filepath: str) -> str:
    """Run radon via the current Python interpreter's -m flag with a 30-second timeout."""
    try:
        result = subprocess.run(
            [_PYTHON, "-m", "radon", "cc", "-j", filepath],
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.stdout
    except subprocess.TimeoutExpired:
        print(f"[TIMEOUT] Radon timed out after 30 seconds on {filepath}")
        return json.dumps({"error": "Radon complexity analysis timed out after 30 seconds."})
    except Exception as e:
        print(f"Radon error: {e}")
        return ""

def analyze_code(request: schemas.AnalysisRequest) -> schemas.AnalysisResponse:
    gemini_client = None
    if GEMINI_API_KEY and len(GEMINI_API_KEY) > 10:
        try:
            gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        except Exception as init_err:
            print(f"[WARNING] Gemini client initialization error: {type(init_err).__name__}")

    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as temp_file:
        temp_file.write(request.code)
        temp_filepath = temp_file.name

    issues = []
    issue_id_counter = 1
    quality_deductions = 0.0
    security_deductions = 0.0
    complexity_deductions = 0.0

    try:
        # --- PYLINT (Quality) ---
        if request.options.quality:
            pylint_out = run_pylint(temp_filepath)
            print(f"[DEBUG] Pylint output length: {len(pylint_out)}")
            if pylint_out.strip():
                try:
                    p_data = json.loads(pylint_out)
                    if isinstance(p_data, dict) and "error" in p_data:
                        issues.append({
                            "id": issue_id_counter,
                            "title": "Pylint Analysis Timeout",
                            "severity": "Medium",
                            "tool": "Pylint",
                            "file": "UploadedCode.py",
                            "line": 1,
                            "category": "quality",
                            "description": p_data["error"],
                            "recommendation": "How to fix: The static quality scan timed out after 30 seconds. Simplify complex loops or break down large files."
                        })
                        issue_id_counter += 1
                        quality_deductions += 15.0
                    elif isinstance(p_data, list):
                        for item in p_data:
                            sev_map = {
                                "fatal": "Critical",
                                "error": "High",
                                "warning": "Medium",
                                "convention": "Low",
                                "refactor": "Low"
                            }
                            sev = sev_map.get(item.get("type", "warning"), "Medium")
                            sym = item.get("symbol", "")

                            if sev == "Critical":
                                quality_deductions += 25.0
                            elif sev == "High":
                                quality_deductions += 15.0
                            elif sev == "Medium":
                                quality_deductions += 5.0
                            else:
                                quality_deductions += 2.0

                            # Use our beginner-friendly dictionary, or fallback to a general tip
                            fallback_rec = f"To fix this, review the code on line {item.get('line', 1)} and resolve the '{sym}' issue."
                            rec = QUICK_FIXES.get(sym, fallback_rec)

                            issues.append({
                                "id": issue_id_counter,
                                "title": f"{item.get('message-id', 'Pylint')}: {sym}",
                                "severity": sev,
                                "tool": "Pylint",
                                "file": "UploadedCode.py",
                                "line": item.get("line", 1),
                                "category": "quality",
                                "description": item.get("message", "Quality issue found."),
                                "recommendation": f"How to fix: {rec}"
                            })
                            issue_id_counter += 1
                except Exception as e:
                    print(f"[DEBUG] Pylint JSON parse error: {e}")

        # --- BANDIT (Security) ---
        if request.options.security:
            bandit_out = run_bandit(temp_filepath)
            print(f"[DEBUG] Bandit output length: {len(bandit_out)}")
            if bandit_out.strip():
                try:
                    b_data = json.loads(bandit_out)
                    if isinstance(b_data, dict) and "error" in b_data:
                        issues.append({
                            "id": issue_id_counter,
                            "title": "Bandit Security Timeout",
                            "severity": "Medium",
                            "tool": "Bandit",
                            "file": "UploadedCode.py",
                            "line": 1,
                            "category": "security",
                            "description": b_data["error"],
                            "recommendation": "How to fix: The security scan timed out after 30 seconds. Simplify complex constructs or check file size."
                        })
                        issue_id_counter += 1
                        security_deductions += 15.0
                    elif isinstance(b_data, dict):
                        for item in b_data.get("results", []):
                            sev = item.get("issue_severity", "MEDIUM")
                            if sev == "HIGH":
                                sev_str = "High"
                                security_deductions += 25.0
                            elif sev == "MEDIUM":
                                sev_str = "Medium"
                                security_deductions += 15.0
                            else:
                                sev_str = "Low"
                                security_deductions += 5.0

                            b_id = item.get("test_id", "")

                            fallback_rec = f"Avoid doing this in production code: {item.get('issue_text', '')}."
                            rec = QUICK_FIXES.get(b_id, fallback_rec)

                            issues.append({
                                "id": issue_id_counter,
                                "title": item.get("test_name", "Security Issue").replace("_", " ").title(),
                                "severity": sev_str,
                                "tool": "Bandit",
                                "file": "UploadedCode.py",
                                "line": item.get("line_number", 1),
                                "category": "security",
                                "description": item.get("issue_text", "A security vulnerability was found."),
                                "recommendation": f"How to fix: {rec}"
                            })
                            issue_id_counter += 1
                except Exception as e:
                    print(f"[DEBUG] Bandit JSON parse error: {e}")

        # --- RADON (Complexity) ---
        if request.options.complexity:
            radon_out = run_radon(temp_filepath)
            print(f"[DEBUG] Radon output length: {len(radon_out)}")
            if radon_out.strip():
                try:
                    r_data = json.loads(radon_out)
                    if isinstance(r_data, dict) and "error" in r_data:
                        issues.append({
                            "id": issue_id_counter,
                            "title": "Radon Complexity Timeout",
                            "severity": "Medium",
                            "tool": "Radon",
                            "file": "UploadedCode.py",
                            "line": 1,
                            "category": "complexity",
                            "description": r_data["error"],
                            "recommendation": "How to fix: The complexity analysis timed out after 30 seconds. Simplify long functions and reduce cyclomatic branching."
                        })
                        issue_id_counter += 1
                        complexity_deductions += 15.0
                    elif isinstance(r_data, dict):
                        for _filepath_key, blocks in r_data.items():
                            if isinstance(blocks, list):
                                for block in blocks:
                                    if isinstance(block, dict):
                                        rank = block.get("rank", "A")
                                        # Only flag C and above (complex functions)
                                        if rank in ["C", "D", "E", "F"]:
                                            if rank == "C":
                                                sev = "Medium"
                                                complexity_deductions += 10.0
                                            elif rank == "D":
                                                sev = "High"
                                                complexity_deductions += 20.0
                                            elif rank == "E":
                                                sev = "Critical"
                                                complexity_deductions += 30.0
                                            else:
                                                sev = "Critical"
                                                complexity_deductions += 40.0

                                            issues.append({
                                                "id": issue_id_counter,
                                                "title": f"High Complexity: {block.get('name', 'unknown')} (Rank {rank})",
                                                "severity": sev,
                                                "tool": "Radon",
                                                "file": "UploadedCode.py",
                                                "line": block.get("lineno", 1),
                                                "category": "complexity",
                                                "description": f"The {block.get('type', 'block')} '{block.get('name', 'unknown')}' has a cyclomatic complexity score of {block.get('complexity', 0)} (Grade {rank}). Scores above 10 are considered high complexity.",
                                                "recommendation": "How to fix: This section is too long and has too many if/else statements. Break the logic down into smaller helper functions so it's easier to read."
                                            })
                                            issue_id_counter += 1
                except Exception as e:
                    print(f"[DEBUG] Radon JSON parse error: {e}")

        # --- AI Summary ---
        summary = ""
        try:
            if issues:
                issues_text = json.dumps(issues, indent=2)
                prompt = f"""
You are PyGuardian AI, an expert but extremely beginner-friendly Python coding tutor.
I ran static analysis tools on a Python file and found {len(issues)} issues.
Here is a summary of the issues found:
{issues_text}

Write a highly encouraging, completely beginner-friendly summary in exactly 2-3 sentences.
First sentence: Explain what the developer did well and what the main problem is.
Second sentence: Explicitly tell them HOW to fix the most common issue in simple English (no complex jargon).
Return ONLY a JSON object like this:
{{
    "summary": "Your 2-3 sentence beginner-friendly summary here."
}}
"""
            else:
                prompt = """
You are PyGuardian AI, an expert Python code reviewer.
Static analysis tools found NO issues in the submitted code.
Write a friendly 1-2 sentence message praising the code quality.
Return ONLY a JSON object like this:
{
    "summary": "Your 1-2 sentence message here."
}
"""

            response_text = ""
            if gemini_client:
                generation_config = types.GenerateContentConfig(temperature=0.0)
                for attempt in range(2):
                    try:
                        response = gemini_client.models.generate_content(
                            model="gemini-3.1-flash-lite",
                            contents=prompt,
                            config=generation_config
                        )
                        if response and response.text:
                            response_text = response.text.strip()
                            break
                    except Exception as gen_err:
                        if attempt == 0:
                            time.sleep(1.5)
                        else:
                            raise gen_err

            # Strip possible markdown code fences
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            try:
                parsed = json.loads(response_text.strip())
                summary = parsed.get("summary", "Analysis completed successfully.")
            except Exception:
                summary = "Analysis completed. Please review the detailed issues below."
        except Exception as ai_err:
            print(f"[WARNING] AI Summary generation failed: {ai_err}")
            if issues:
                summary = "Analysis completed, but AI summary generation failed (e.g., due to rate limit). Please review the detailed issues below."
            else:
                summary = "Analysis completed successfully. No issues found. (AI summary generation failed)."

        quality_score = max(0.0, min(100.0, round(100.0 - quality_deductions, 1))) if request.options.quality else 100.0
        security_score = max(0.0, min(100.0, round(100.0 - security_deductions, 1))) if request.options.security else 100.0
        complexity_score = max(0.0, min(100.0, round(100.0 - complexity_deductions, 1))) if request.options.complexity else 100.0

        return schemas.AnalysisResponse(
            summary=summary,
            issues=issues,
            quality_score=quality_score,
            security_score=security_score,
            complexity_score=complexity_score
        )

    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] analyze_code exception: {error_msg}")
        return schemas.AnalysisResponse(
            summary=f"Analysis encountered an error: {error_msg}. Please try again.",
            issues=[
                {
                    "id": 999,
                    "title": "Analysis Pipeline Failed",
                    "severity": "Critical",
                    "tool": "System",
                    "file": "System",
                    "line": 0,
                    "category": "security",
                    "description": f"The backend encountered an error: {error_msg}",
                    "recommendation": "Check that the backend server is running correctly and try again."
                }
            ],
            quality_score=0.0,
            security_score=0.0,
            complexity_score=0.0
        )
    finally:
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)

def chat_with_ai(request: schemas.ChatRequest) -> schemas.ChatResponse:
    try:
        if not GEMINI_API_KEY or len(GEMINI_API_KEY) <= 10:
            return schemas.ChatResponse(reply="AI Assistant is unavailable: GEMINI_API_KEY is not configured.")

        client = genai.Client(api_key=GEMINI_API_KEY)

        # Build the conversation payload for Gemini using google-genai Content types
        # Gemini expects roles to be either 'user' or 'model'
        # Crucially, the conversation history MUST start with a 'user' message
        raw_history = []
        for msg in request.messages[:-1]:  # all except the very last one
            role = "user" if msg.role == "user" else "model"
            raw_history.append(types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg.content)]
            ))

        # Strip any leading 'model' messages so it starts with 'user'
        while raw_history and raw_history[0].role == "model":
            raw_history.pop(0)

        system_prompt = """
You are PyGuardian AI, an expert AI assistant specialized STRICTLY in Python programming.
RULES:
1. If the user asks a question about Python, software engineering in Python, or the issues found in their Python code, answer it perfectly and beginner-friendly.
2. If the user asks about ANY OTHER TOPIC (general knowledge, math, history, other programming languages like JavaScript/C++, etc.), you MUST politely refuse to answer and remind them that you only help with Python.
"""
        chat_config = types.GenerateContentConfig(
            system_instruction=system_prompt.strip()
        )

        chat = client.chats.create(
            model="gemini-3.1-flash-lite",
            history=raw_history,
            config=chat_config
        )

        last_user_msg = request.messages[-1].content
        response = None
        for attempt in range(3):
            try:
                response = chat.send_message(last_user_msg)
                break
            except Exception as send_err:
                if attempt < 2:
                    time.sleep(1.5 * (attempt + 1))
                else:
                    raise send_err

        reply_text = response.text if response and response.text else "I could not generate a response at this time."
        return schemas.ChatResponse(reply=reply_text)
    except Exception as e:
        # Safe logging: log error class name only, never credentials or raw trace with secrets
        print(f"[ERROR] chat_with_ai exception: {type(e).__name__}")
        return schemas.ChatResponse(reply="I'm sorry, my AI backend encountered an error and couldn't process your request.")
