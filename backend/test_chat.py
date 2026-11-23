import sys
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=GEMINI_API_KEY)

raw_history = [
    types.Content(role="user", parts=[types.Part.from_text(text="Can you explain the SQL injection vulnerability found in database.py line 42?")]),
    types.Content(role="model", parts=[types.Part.from_text(text="**SQL Injection in database.py (Line 42)**...")])
]

print("Starting chat with history...")
try:
    system_prompt = "You are PyGuardian AI, an expert AI assistant specialized STRICTLY in Python programming."
    chat_config = types.GenerateContentConfig(system_instruction=system_prompt)
    chat = client.chats.create(model="gemini-3.1-flash-lite", history=raw_history, config=chat_config)
    last_user_msg = "Store your age in a variable and print it."
    print("Sending message...")
    response = chat.send_message(last_user_msg)
    print("Success:", response.text[:50])
except Exception as e:
    import traceback
    print("ERROR:")
    traceback.print_exc()
