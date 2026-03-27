from app.core.config import settings

def send_email(to: str, subject: str, body: str) -> bool:
    """
    Simulates sending an email
    """
    print("=" * 40)
    print(f"MOCK EMAIL SENT")
    print(f"To: {to}")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    print("=" * 40)
    
    # Normally check settings.SMTP_HOST etc. and use smtplib
    return True
