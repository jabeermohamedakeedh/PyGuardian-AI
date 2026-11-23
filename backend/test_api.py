import json
import urllib.request

url = 'http://127.0.0.1:8000/api/analyze'

# Bad code that definitely triggers pylint, bandit, and radon issues
bad_code = """
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
                    if e > 0:
                        for i in range(a):
                            for j in range(b):
                                if i == j:
                                    if c == d:
                                        print(i)
                                    elif c == e:
                                        print(j)
                                    else:
                                        print(i+j)
    x = a + b + c + d + e
    return x

md5_hash = hashlib.md5(b"test")
"""

data = json.dumps({
    'code': bad_code,
    'options': {'quality': True, 'security': True, 'complexity': True}
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print('SUCCESS!')
        print('Summary:', result['summary'][:200])
        print('Issue Count:', len(result['issues']))
        for i in result['issues']:
            print(f"  [{i['category'].upper()}] {i['severity']:8} | {i['tool']:8} | Line {i['line']:3} | {i['title']}")
except Exception as e:
    print('ERROR:', e)
