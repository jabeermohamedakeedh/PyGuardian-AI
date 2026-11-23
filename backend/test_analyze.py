import urllib.request
import json
import time

data = json.dumps({
    'code': 'print("hello")',
    'options': {'quality': True, 'security': True, 'complexity': True}
}).encode('utf-8')

req = urllib.request.Request('http://127.0.0.1:8000/api/analyze', data=data, headers={'Content-Type': 'application/json'})

print("Sending request...")
start = time.time()
try:
    response = urllib.request.urlopen(req, timeout=30)
    print(f"Success! Took {time.time() - start:.2f} seconds.")
    print(response.read().decode('utf-8'))
except Exception as e:
    print(f"Failed after {time.time() - start:.2f} seconds: {e}")
