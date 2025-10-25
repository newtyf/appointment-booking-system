# backend/app/models/notification.py
from sqlalchemy import Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from typing import Optional
from app.db.base import Base

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    appointment_id: Mapped[int] = mapped_column(Integer, ForeignKey("appointments.id"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    type: Mapped[str] = mapped_column(String(length=30))  # reservado, confirmado, cancelado, recordatorio
    channel: Mapped[str] = mapped_column(String(length=30))  # email, web
    status: Mapped[str] = mapped_column(String(length=30))  # enviado, fallido, pendiente
    title: Mapped[Optional[str]] = mapped_column(String(length=255), nullable=True)  # Título de la notificación
    body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Cuerpo/mensaje de la notificación
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, type='{self.type}', channel='{self.channel}')>"
