# backend/app/models/notification.py
from sqlalchemy import Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    appointment_id: Mapped[int] = mapped_column(Integer, ForeignKey("appointments.id"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    type: Mapped[str] = mapped_column(String(length=30))  # confirmación, recordatorio, cancelación
    channel: Mapped[str] = mapped_column(String(length=30))  # email, sms, etc.
    status: Mapped[str] = mapped_column(String(length=30))  # enviado, fallido
    sent_at: Mapped[DateTime] = mapped_column(DateTime)

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, type='{self.type}')>"
