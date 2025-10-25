# app/api/routes/notifications.py
from typing import Annotated
from fastapi import APIRouter, Depends, BackgroundTasks
from app.api.dependencies.deps import get_db_session
from app.schemas.notification import NotificationCreate, NotificationInDB
from app.services.notification_service import NotificationService
from app.services.email_service import EmailService

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.post("/", response_model=NotificationInDB)
async def create_and_send_notification(
    notification_in: NotificationCreate,
    background_tasks: BackgroundTasks,
    db: Annotated = Depends(get_db_session)
):
    notif_service = NotificationService(db)
    
    # Crear notificación usando parámetros individuales
    notif = await notif_service.create_notification(
        appointment_id=notification_in.appointment_id,
        user_id=notification_in.user_id,
        type=notification_in.type,
        channel=notification_in.channel,
        status=notification_in.status,
        title=notification_in.title,
        body=notification_in.body
    )

    # Enviar correo en segundo plano si es de tipo email
    if notification_in.channel == "email":
        background_tasks.add_task(notif_service.send_email_notification, notif.id)
    
    return notif

@router.get("/send")
def send_test_email():
    email_service = EmailService()
    email_service.send_email(
        to_email="osquicastro05@gmail.com",
        subject="Prueba de notificación",
        body="Este es un correo de prueba enviado desde FastAPI 🚀"
    )
    return {"status": "enviado"}