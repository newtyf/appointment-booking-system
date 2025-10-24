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
    notif = await notif_service.create_notification(notification_in)

    # Enviar correo en segundo plano
    background_tasks.add_task(notif_service.send_email_notification, notif)
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