import os
import smtplib
from dotenv import load_dotenv

load_dotenv()
sender_email = os.getenv("SMTP_USER")
sender_password = os.getenv("SMTP_PASSWORD")
smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
smtp_port = int(os.getenv("SMTP_PORT", 587))

print(f"Testing SMTP login for {sender_email} on {smtp_server}:{smtp_port}")

try:
    server = smtplib.SMTP(smtp_server, smtp_port)
    server.set_debuglevel(1)
    server.starttls()
    server.login(sender_email, sender_password)
    print("Login successful!")
    server.quit()
except Exception as e:
    import traceback
    print("Failed to login:")
    traceback.print_exc()
