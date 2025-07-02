# backend/app/models/reminder.py
from sqlalchemy import Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Reminder(Base):
    __tablename__ = "reminders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    appointment_id: Mapped[int] = mapped_column(Integer, ForeignKey("appointments.id"))
    sent: Mapped[bool] = mapped_column(Boolean, default=False)
    sent_at: Mapped[DateTime] = mapped_column(DateTime)

    def __repr__(self):
        return f"<Reminder(id={self.id}, appointment_id={self.appointment_id}, sent={self.sent})>"
