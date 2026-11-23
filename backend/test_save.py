import requests

payload = {
    "user_id": 1,
    "filename": "test.py",
    "risk_score": 10.0,
    "quality_score": 100.0,
    "security_score": 100.0,
    "complexity_score": 100.0,
    "issue_count": 0,
    "issues_json": "[]",
    "summary": "test"
}

try:
    res = requests.post("http://127.0.0.1:8000/api/analyses/save", json=payload)
    print("STATUS:", res.status_code)
    print("RESPONSE:", res.text)
except Exception as e:
    print("ERROR:", e)
