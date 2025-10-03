from datetime import datetime, timedelta
from sqlalchemy import select, and_
from app.models.appointment import Appointment
from app.models.service import Service

class AvailabilityService:
    def __init__(self, db):
        self.db = db
    
    async def check_availability(self, service_id: int, stylist_id: int, date: datetime):
        # Obtener duración del servicio
        service_result = await self.db.execute(
            select(Service).where(Service.id == service_id)
        )
        service = service_result.scalar_one_or_none()
        
        if not service:
            return {"available": False, "reason": "Servicio no encontrado"}
        
        # Calcular hora de fin basado en duración
        end_time = date + timedelta(minutes=service.duration_min)
        
        # Validar que no termine después de las 8 PM
        if end_time.hour >= 20:
            return {
                "available": False, 
                "reason": f"El servicio terminaría a las {end_time.strftime('%H:%M')}, fuera del horario (8 AM - 8 PM)"
            }
        
        # Verificar si el estilista está ocupado
        existing_appointments = await self.db.execute(
            select(Appointment).where(
                and_(
                    Appointment.stylist_id == stylist_id,
                    Appointment.status != 'cancelled',
                    Appointment.date < end_time,
                )
            )
        )
        
        if existing_appointments.scalar_one_or_none():
            return {
                "available": False,
                "reason": f"El estilista {stylist_id} no está disponible en ese horario"
            }
        
        return {"available": True}