from app.core.config import settings

def send_email(to: str, subject: str, body: str):
    # This is currently a simulated function logic for emails.
    print(f"--- Sending Email Simulation ---")
    print(f"SMTP Host: {settings.SMTP_HOST}:{settings.SMTP_PORT}")
    print(f"To: {to}")
    print(f"Subject: {subject}")
    print(f"Body:\n{body}")
    print("----------------------------------")
