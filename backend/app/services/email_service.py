# app/services/email_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.sender = settings.EMAIL_SENDER
        self.password = settings.EMAIL_PASSWORD

    def send_email(self, to_email: str, subject: str, body: str, html: str | None = None):
        """Envia un correo con soporte para HTML."""
        if html:
            # Crear mensaje multipart para HTML
            msg = MIMEMultipart("alternative")
            msg["From"] = self.sender
            msg["To"] = to_email
            msg["Subject"] = subject
            
            # Agregar texto plano como fallback
            part1 = MIMEText(body, "plain")
            part2 = MIMEText(html, "html")
            
            msg.attach(part1)
            msg.attach(part2)
        else:
            # Mensaje de texto plano simple
            msg = MIMEText(body)
            msg["From"] = self.sender
            msg["To"] = to_email
            msg["Subject"] = subject

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender, self.password)
                server.send_message(msg)
            print(f"Email enviado a {to_email}")
        except Exception as e:
            print(f"❌ Error al enviar email a {to_email}: {e}")
