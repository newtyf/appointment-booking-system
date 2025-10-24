# app/services/notification_service.py
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate
from app.services.user_service import UserService
from app.services.email_service import EmailService

class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.email_service = EmailService()

    async def create_notification(self, notification_in: NotificationCreate) -> Notification:
        """Crea la notificación en la base de datos."""
        db_notification = Notification(**notification_in.model_dump())
        self.db.add(db_notification)
        await self.db.commit()
        await self.db.refresh(db_notification)
        return db_notification

    async def send_email_notification(self, notification: Notification):
        """Envía la notificación por correo al usuario asociado."""
        user_service = UserService(self.db)
        user = await user_service.get_user(notification.user_id)

        if not user or not getattr(user, "email", None):
            notification.status = "fallido"
            await self.db.commit()
            return

        subject = f"[{notification.type.capitalize()}] de tu cita"
        body = f"Hola {user.name}, tu cita ha sido {notification.type.lower()}."

        try:
            self.email_service.send_email(user.email, subject, body)
            notification.status = "enviado"
            notification.sent_at = datetime.now(timezone.utc)
        except Exception as e:
            print(f"Error enviando email: {e}")
            notification.status = "fallido"
        finally:
            # 🔥 Solución al error de “not persistent”
            db_notification = await self.db.get(Notification, notification.id)
            if db_notification:
                db_notification.status = notification.status
                db_notification.sent_at = notification.sent_at
                await self.db.commit()
