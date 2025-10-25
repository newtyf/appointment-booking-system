from pydantic import BaseModel
from datetime import datetime

class NotificationBase(BaseModel):
    appointment_id: int
    user_id: int
    type: str  # reservado, confirmado, cancelado, recordatorio
    channel: str  # email, web
    status: str  # enviado, fallido, pendiente
    title: str | None = None
    body: str | None = None
    sent_at: datetime | None = None

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    status: str | None = None
    title: str | None = None
    body: str | None = None
    sent_at: datetime | None = None

class NotificationInDB(NotificationBase):
    id: int

    class Config:
        from_attributes = True
