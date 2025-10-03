# backend/app/models/appointment.py
from sqlalchemy import Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func 
from app.db.base import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    client_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    stylist_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    service_id: Mapped[int] = mapped_column(Integer, ForeignKey("services.id"))
    date: Mapped[DateTime] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(length=30))
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    modified_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now()) 
    updated_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Appointment(id={self.id}, client_id={self.client_id}, stylist_id={self.stylist_id}, date={self.date})>"
