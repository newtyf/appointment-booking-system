# backend/app/models/appointment.py
from sqlalchemy import Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func 
from typing import Optional
from app.db.base import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Cliente registrado (opcional - NULL si es walk-in)
    client_id: Mapped[Optional[int]] = mapped_column(
        Integer, 
        ForeignKey("users.id"), 
        nullable=True 
    )
    
    # Datos del cliente walk-in (solo si client_id es NULL)
    client_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    client_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    client_email: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Indica si es un cliente walk-in (sin cuenta) o registrado
    is_walk_in: Mapped[bool] = mapped_column(Boolean, default=False)
    
    stylist_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    service_id: Mapped[int] = mapped_column(Integer, ForeignKey("services.id"))
    date: Mapped[DateTime] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(length=30), default="pending")
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    modified_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now()) 
    updated_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        if self.is_walk_in:
            return f"<Appointment(id={self.id}, walk-in='{self.client_name}', stylist_id={self.stylist_id}, date={self.date})>"
        else:
            return f"<Appointment(id={self.id}, client_id={self.client_id}, stylist_id={self.stylist_id}, date={self.date})>"
    
    def to_dict(self):
        """Convertir el objeto Appointment a diccionario para serialización JSON"""
        return {
            'id': self.id,
            'client_id': self.client_id,
            'client_name': self.client_name,
            'client_phone': self.client_phone,
            'client_email': self.client_email,
            'is_walk_in': self.is_walk_in,
            'stylist_id': self.stylist_id,
            'service_id': self.service_id,
            'date': self.date.isoformat() if self.date else None,
            'status': self.status,
            'created_by': self.created_by,
            'modified_by': self.modified_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }