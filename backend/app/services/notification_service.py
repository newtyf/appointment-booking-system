# app/services/notification_service.py
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.notification import Notification
from app.models.appointment import Appointment
from app.models.user import User
from app.models.service import Service
from app.services.user_service import UserService
from app.services.email_service import EmailService
from app.utils.email_templates import generate_appointment_email_html

class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.email_service = EmailService()

    async def create_notification(
        self,
        appointment_id: int,
        user_id: int,
        type: str,
        channel: str = "email",
        status: str = "pendiente",
        title: str | None = None,
        body: str | None = None
    ) -> Notification:
        """Crea la notificación en la base de datos sin hacer commit."""
        db_notification = Notification(
            appointment_id=appointment_id,
            user_id=user_id,
            type=type,
            channel=channel,
            status=status,
            title=title,
            body=body
        )
        self.db.add(db_notification)
        await self.db.flush()
        return db_notification

    async def create_and_send_notification(
        self,
        appointment_id: int,
        user_id: int,
        type: str,
    ) -> list[Notification]:
        """
        Crea notificaciones de tipo email y web, y envía la de email inmediatamente.
        
        Args:
            appointment_id: ID de la cita
            user_id: ID del usuario
            type: Tipo de notificación basado en el estado de la cita (reservado, confirmado, cancelado)
        
        Returns:
            Lista con las notificaciones creadas [email_notification, web_notification]
        """
        # Generar título y body según el tipo
        notification_content = self._get_notification_content(type)
        
        # Crear notificación de email
        email_notification = await self.create_notification(
            appointment_id=appointment_id,
            user_id=user_id,
            type=type,
            channel="email",
            status="pendiente",
            title=notification_content["title"],
            body=notification_content["body"]
        )
        
        # Crear notificación web
        web_notification = await self.create_notification(
            appointment_id=appointment_id,
            user_id=user_id,
            type=type,
            channel="web",
            status="pendiente",
            title=notification_content["title"],
            body=notification_content["body"]
        )

        # Enviar la notificación por email
        await self.send_email_notification(email_notification.id)
        
        # Marcar la notificación web como enviada (ya está en la BD para que el frontend la consuma)
        web_notification.status = "enviado"
        web_notification.sent_at = datetime.now(timezone.utc)
        await self.db.flush()

        return [email_notification, web_notification]

    def _get_notification_content(self, type: str) -> dict:
        """Genera el título y body según el tipo de notificación."""
        content_map = {
            "reservado": {
                "title": "Cita Reservada",
                "body": "Tu cita ha sido reservada exitosamente. Pronto un miembro de nuestro equipo la confirmará."
            },
            "confirmado": {
                "title": "Cita Confirmada",
                "body": "¡Excelente noticia! Tu cita ha sido confirmada y te esperamos con los brazos abiertos."
            },
            "cancelado": {
                "title": "Cita Cancelada",
                "body": "Lamentamos informarte que tu cita ha sido cancelada. Esperamos poder atenderte pronto en otra oportunidad."
            },
            "recordatorio": {
                "title": "Recordatorio de Cita",
                "body": "Te recordamos tu próxima cita. ¡Nos vemos pronto!"
            }
        }
        return content_map.get(type, content_map["reservado"])

    async def send_email_notification(self, notification_id: int):
        """Envía la notificación por correo al usuario asociado."""
        # Obtener el objeto notification desde la BD con la sesión activa
        notification = await self.db.get(Notification, notification_id)
        
        if not notification:
            print(f"Error: Notificación {notification_id} no encontrada")
            return
        
        user_service = UserService(self.db)
        user = await user_service.get_user(notification.user_id)

        if not user or not getattr(user, "email", None):
            notification.status = "fallido"
            await self.db.flush()
            return

        # Obtener datos completos de la cita
        appointment_result = await self.db.execute(
            select(Appointment).where(Appointment.id == notification.appointment_id)
        )
        appointment = appointment_result.scalar_one_or_none()
        
        if not appointment:
            notification.status = "fallido"
            await self.db.flush()
            return
        
        # Obtener datos del servicio
        service_result = await self.db.execute(
            select(Service).where(Service.id == appointment.service_id)
        )
        service = service_result.scalar_one_or_none()
        
        # Obtener datos del estilista
        stylist_result = await self.db.execute(
            select(User).where(User.id == appointment.stylist_id)
        )
        stylist = stylist_result.scalar_one_or_none()
        
        # Preparar datos de la cita
        appointment_data = {
            "service_name": service.name if service else "N/A",
            "stylist_name": stylist.name if stylist else "N/A",
            "date": appointment.date
        }
        
        # Definir subject según el tipo de notificación
        subject_map = {
            "reservado": "Cita Reservada - Monarca Beauty Salon",
            "confirmado": "Cita Confirmada - Monarca Beauty Salon",
            "cancelado": "Cita Cancelada - Monarca Beauty Salon",
            "recordatorio": "Recordatorio de Cita - Monarca Beauty Salon"
        }
        subject = subject_map.get(notification.type, "Notificación de Cita - Monarca Beauty Salon")
        
        # Texto plano como fallback
        fallback_messages = {
            "reservado": f"Hola {user.name}, tu cita ha sido reservada y está pendiente de confirmación.",
            "confirmado": f"Hola {user.name}, tu cita ha sido confirmada. ¡Te esperamos!",
            "cancelado": f"Hola {user.name}, lamentamos informarte que tu cita ha sido cancelada.",
            "recordatorio": f"Hola {user.name}, te recordamos tu próxima cita."
        }
        body = fallback_messages.get(notification.type, f"Hola {user.name}, actualización sobre tu cita.")
        
        # Generar HTML usando la función de utilidad
        html = generate_appointment_email_html(
            user_name=user.name,
            notification_type=notification.type,
            appointment_data=appointment_data
        )

        try:
            self.email_service.send_email(user.email, subject, body, html)
            notification.status = "enviado"
            notification.sent_at = datetime.now(timezone.utc)
            await self.db.flush()
        except Exception as e:
            print(f"Error enviando email: {e}")
            notification.status = "fallido"
