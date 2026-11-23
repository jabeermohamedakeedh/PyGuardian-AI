import json
import urllib.request
import hashlib

url = 'http://127.0.0.1:8000/api/analyze'

test_code = """
import os
import subprocess
import hashlib

password = "hardcoded_password_123"

def process_user_input(user_input):
    result = subprocess.run(user_input, shell=True)
    return result

def very_complex_function(a, b, c, d, e):
    if a > 0:
        if b > 0:
            if c > 0:
                if d > 0:
                    for i in range(a):
                        for j in range(b):
                            if i == j:
                                print(i)
    return a + b
"""

def call_api(options):
    data = json.dumps({'code': test_code, 'options': options}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def score(issues, category):
    SEV = {'Critical': 25, 'High': 15, 'Medium': 7, 'Low': 3}
    cat_issues = [i for i in issues if i['category'] == category]
    if not cat_issues:
        return 100
    penalty = sum(SEV.get(i['severity'], 3) for i in cat_issues)
    return max(0, 100 - penalty)

print("=" * 60)
print("TEST: Do quality scores stay consistent across tool combos?")
print("=" * 60)

# Run 1: All 3 tools
r1 = call_api({'quality': True, 'security': True, 'complexity': True})
q1 = [i for i in r1['issues'] if i['category'] == 'quality']
s1 = [i for i in r1['issues'] if i['category'] == 'security']
c1 = [i for i in r1['issues'] if i['category'] == 'complexity']
print(f"\nRun 1 (All 3 tools):")
print(f"  Quality  issues: {len(q1)} -> Score: {score(r1['issues'], 'quality')}")
print(f"  Security issues: {len(s1)} -> Score: {score(r1['issues'], 'security')}")
print(f"  Complexity issues: {len(c1)} -> Score: {score(r1['issues'], 'complexity')}")

# Run 2: Quality only
r2 = call_api({'quality': True, 'security': False, 'complexity': False})
q2 = [i for i in r2['issues'] if i['category'] == 'quality']
print(f"\nRun 2 (Quality only):")
print(f"  Quality  issues: {len(q2)} -> Score: {score(r2['issues'], 'quality')}")

# Run 3: Security only
r3 = call_api({'quality': False, 'security': True, 'complexity': False})
s3 = [i for i in r3['issues'] if i['category'] == 'security']
print(f"\nRun 3 (Security only):")
print(f"  Security issues: {len(s3)} -> Score: {score(r3['issues'], 'security')}")

# Compare
print("\n" + "=" * 60)
print("CONSISTENCY CHECK:")
q_match = len(q1) == len(q2)
s_match = len(s1) == len(s3)
print(f"  Quality  issues same (Run1 vs Run2): {'YES' if q_match else 'NO'} ({len(q1)} vs {len(q2)})")
print(f"  Security issues same (Run1 vs Run3): {'YES' if s_match else 'NO'} ({len(s1)} vs {len(s3)})")
print(f"  Quality  Score  same (Run1 vs Run2): {'YES' if score(r1['issues'], 'quality') == score(r2['issues'], 'quality') else 'NO'} ({score(r1['issues'], 'quality')} vs {score(r2['issues'], 'quality')})")
print(f"  Security Score  same (Run1 vs Run3): {'YES' if score(r1['issues'], 'security') == score(r3['issues'], 'security') else 'NO'} ({score(r1['issues'], 'security')} vs {score(r3['issues'], 'security')})")
