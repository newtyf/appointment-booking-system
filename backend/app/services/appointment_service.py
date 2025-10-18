from app.models.appointment import Appointment
from app.models.user import User
from app.models.service import Service
from app.schemas.appointment import (
    AppointmentCreate, 
    AppointmentUpdate, 
    AppointmentInDB,
    AppointmentCreateForClient,
    AppointmentCreateWalkIn
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import HTTPException, status


class AppointmentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ==================== VALIDACIONES ====================
    
    async def _validate_datetime(self, appointment_date: datetime) -> None:
        """Validar fecha/hora"""
        now = datetime.now()
        
        # No permitir citas en el pasado
        if appointment_date < now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot book appointments in the past"
            )
        
        # Validar horario del salón (9am - 8pm)
        if appointment_date.hour < 9 or appointment_date.hour >= 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Salon hours are from 9:00 AM to 8:00 PM"
            )
    
    async def _validate_service_exists(self, service_id: int) -> Service:
        """Verificar que servicio existe"""
        result = await self.db.execute(
            select(Service).where(Service.id == service_id)
        )
        service = result.scalar_one_or_none()
        
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Service with id {service_id} not found"
            )
        
        return service
    
    async def _validate_stylist_exists(self, stylist_id: int) -> User:
        """Verificar que estilista existe y tiene rol correcto"""
        result = await self.db.execute(
            select(User).where(User.id == stylist_id)
        )
        stylist = result.scalar_one_or_none()
        
        if not stylist:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stylist with id {stylist_id} not found"
            )
        
        if stylist.role != "stylist":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User {stylist_id} is not a stylist"
            )
        
        return stylist
    
    async def _validate_client_exists(self, client_id: int) -> User:
        """Verificar que cliente existe"""
        result = await self.db.execute(
            select(User).where(User.id == client_id)
        )
        client = result.scalar_one_or_none()
        
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client with id {client_id} not found"
            )
        
        return client
    
    async def _check_stylist_availability(
        self, 
        stylist_id: int, 
        appointment_date: datetime, 
        service_duration: int,
        exclude_appointment_id: Optional[int] = None
    ) -> None:
        """Verificar que estilista está disponible (evita solapamientos)"""
        appointment_end = appointment_date + timedelta(minutes=service_duration)
        
        query = select(Appointment).where(
            and_(
                Appointment.stylist_id == stylist_id,
                Appointment.status.in_(["pending", "confirmed"]),
                or_(
                    # La nueva cita empieza durante otra cita
                    and_(
                        Appointment.date <= appointment_date,
                        Appointment.date + timedelta(minutes=service_duration) > appointment_date
                    ),
                    # La nueva cita termina durante otra cita
                    and_(
                        Appointment.date < appointment_end,
                        Appointment.date + timedelta(minutes=service_duration) >= appointment_end
                    ),
                    # La nueva cita contiene completamente a otra cita
                    and_(
                        Appointment.date >= appointment_date,
                        Appointment.date < appointment_end
                    )
                )
            )
        )
        
        if exclude_appointment_id:
            query = query.where(Appointment.id != exclude_appointment_id)
        
        result = await self.db.execute(query)
        conflicting_appointment = result.scalar_one_or_none()
        
        if conflicting_appointment:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Stylist is not available at {appointment_date.strftime('%Y-%m-%d %H:%M')}"
            )

    # ==================== MÉTODOS CRUD ====================

    async def list_appointments(self) -> List[Appointment]:
        """Listar todas las citas"""
        result = await self.db.execute(
            select(Appointment).order_by(Appointment.date.desc())
        )
        return result.scalars().all()

    async def list_user_appointments(self, user_id: int) -> List[Appointment]:
        """Listar citas de un cliente"""
        result = await self.db.execute(
            select(Appointment)
            .where(Appointment.client_id == user_id)
            .order_by(Appointment.date.desc())
        )
        return result.scalars().all()
    
    async def list_stylist_appointments(self, stylist_id: int) -> List[Appointment]:
        """Listar citas de un estilista"""
        result = await self.db.execute(
            select(Appointment)
            .where(Appointment.stylist_id == stylist_id)
            .order_by(Appointment.date.asc())
        )
        return result.scalars().all()

    async def get_appointment(self, appointment_id: int) -> Optional[Appointment]:
        """Obtener cita por ID"""
        result = await self.db.execute(
            select(Appointment).where(Appointment.id == appointment_id)
        )
        return result.scalar_one_or_none()

    async def create_appointment(self, appointment_create: AppointmentCreate) -> Appointment:
        """Crear cita (registrado o walk-in) con validaciones"""
        if appointment_create.client_id is None and not appointment_create.client_name:
            raise ValueError("Must provide either client_id or walk-in client information")
        
        if appointment_create.client_id and appointment_create.is_walk_in:
            raise ValueError("Cannot have both client_id and is_walk_in=True")
        
        await self._validate_datetime(appointment_create.date)
        service = await self._validate_service_exists(appointment_create.service_id)
        await self._validate_stylist_exists(appointment_create.stylist_id)
        
        if appointment_create.client_id:
            await self._validate_client_exists(appointment_create.client_id)
        
        await self._check_stylist_availability(
            appointment_create.stylist_id,
            appointment_create.date,
            service.duration_min
        )
        
        appointment = Appointment(**appointment_create.model_dump())
        self.db.add(appointment)
        await self.db.commit()
        await self.db.refresh(appointment)
        return appointment
    
    async def create_appointment_for_client(
        self, 
        appointment_data: AppointmentCreateForClient,
        client_id: int,
        created_by: int
    ) -> Appointment:
        """Cliente crea su propia cita"""
        await self._validate_datetime(appointment_data.date)
        service = await self._validate_service_exists(appointment_data.service_id)
        await self._validate_stylist_exists(appointment_data.stylist_id)
        await self._check_stylist_availability(
            appointment_data.stylist_id,
            appointment_data.date,
            service.duration_min
        )
        
        appointment = Appointment(
            client_id=client_id,
            stylist_id=appointment_data.stylist_id,
            service_id=appointment_data.service_id,
            date=appointment_data.date,
            status="pending",
            is_walk_in=False,
            created_by=created_by,
            modified_by=created_by
        )
        self.db.add(appointment)
        await self.db.commit()
        await self.db.refresh(appointment)
        return appointment
    
    async def create_walk_in_appointment(
        self,
        appointment_data: AppointmentCreateWalkIn,
        created_by: int
    ) -> Appointment:
        """Crear cita para walk-in"""
        await self._validate_datetime(appointment_data.date)
        service = await self._validate_service_exists(appointment_data.service_id)
        await self._validate_stylist_exists(appointment_data.stylist_id)
        await self._check_stylist_availability(
            appointment_data.stylist_id,
            appointment_data.date,
            service.duration_min
        )
        
        appointment = Appointment(
            client_id=None,
            client_name=appointment_data.client_name,
            client_phone=appointment_data.client_phone,
            client_email=appointment_data.client_email,
            stylist_id=appointment_data.stylist_id,
            service_id=appointment_data.service_id,
            date=appointment_data.date,
            status=appointment_data.status,
            is_walk_in=True,
            created_by=created_by,
            modified_by=created_by
        )
        self.db.add(appointment)
        await self.db.commit()
        await self.db.refresh(appointment)
        return appointment

    async def update_appointment(
        self, 
        appointment_id: int, 
        appointment_update: AppointmentUpdate
    ) -> Optional[Appointment]:
        """Actualizar cita"""
        appointment = await self.get_appointment(appointment_id)
        if not appointment:
            return None
        
        if appointment_update.date:
            await self._validate_datetime(appointment_update.date)
            service = await self._validate_service_exists(appointment.service_id)
            await self._check_stylist_availability(
                appointment.stylist_id,
                appointment_update.date,
                service.duration_min,
                exclude_appointment_id=appointment_id
            )
        
        if appointment_update.stylist_id:
            await self._validate_stylist_exists(appointment_update.stylist_id)
        
        if appointment_update.service_id:
            await self._validate_service_exists(appointment_update.service_id)
        
        for field, value in appointment_update.model_dump(exclude_unset=True).items():
            setattr(appointment, field, value)
        
        appointment.updated_at = datetime.now()
        
        await self.db.commit()
        await self.db.refresh(appointment)
        return appointment
    
    async def update_appointment_status(
        self,
        appointment_id: int,
        status: str,
        modified_by: int
    ) -> Optional[Appointment]:
        """Actualizar solo estado de cita"""
        appointment = await self.get_appointment(appointment_id)
        if not appointment:
            return None
        
        valid_statuses = ["pending", "confirmed", "completed", "cancelled", "no-show"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        appointment.status = status
        appointment.modified_by = modified_by
        appointment.updated_at = datetime.now()
        
        await self.db.commit()
        await self.db.refresh(appointment)
        return appointment

    async def delete_appointment(self, appointment_id: int) -> Optional[Appointment]:
        """Eliminar cita"""
        appointment = await self.get_appointment(appointment_id)
        if not appointment:
            return None
        
        await self.db.delete(appointment)
        await self.db.commit()
        return appointment
    
    async def can_user_access_appointment(self, appointment: Appointment, user: User) -> bool:
        """Verificar permisos de acceso a cita"""
        if user.role in ["admin", "receptionist"]:
            return True
        if user.role == "stylist":
            return appointment.stylist_id == user.id
        if user.role == "client":
            return appointment.client_id == user.id
        return False

    # ==================== DISPONIBILIDAD ====================
    
    async def get_availability(
        self,
        date_str: str,
        service_id: Optional[int] = None,
        stylist_id: Optional[int] = None
    ) -> dict:
        """Obtener horarios disponibles"""
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )
        
        # Validar que no sea fecha pasada
        if target_date < datetime.now().date():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot check availability for past dates"
            )
        
        # Obtener duración del servicio si se especificó
        service_duration = 30  
        service_name = None
        if service_id:
            service = await self._validate_service_exists(service_id)
            service_duration = service.duration_min
            service_name = service.name
        
        # Obtener estilistas
        if stylist_id:
            # Solo un estilista específico
            stylist = await self._validate_stylist_exists(stylist_id)
            stylists = [stylist]
        else:
            # Todos los estilistas
            result = await self.db.execute(
                select(User).where(User.role == "stylist")
            )
            stylists = result.scalars().all()
            
            if not stylists:
                return {
                    "date": date_str,
                    "service_id": service_id,
                    "service_name": service_name,
                    "service_duration": service_duration,
                    "stylists": []
                }
        
        stylists_availability = []
        
        for stylist in stylists:
            available_slots = await self._get_available_slots_for_stylist(
                stylist.id,
                target_date,
                service_duration
            )
            
            stylists_availability.append({
                "stylist_id": stylist.id,
                "stylist_name": stylist.name,
                "available_slots": available_slots
            })
        
        return {
            "date": date_str,
            "service_id": service_id,
            "service_name": service_name,
            "service_duration": service_duration,
            "stylists": stylists_availability
        }
    
    async def _get_available_slots_for_stylist(
        self,
        stylist_id: int,
        target_date,
        service_duration: int
    ) -> List[str]:
        """Generar slots disponibles para un estilista"""
        start_hour = 9
        end_hour = 20
        slot_interval = 30
        
        start_of_day = datetime.combine(target_date, datetime.min.time().replace(hour=start_hour))
        end_of_day = datetime.combine(target_date, datetime.min.time().replace(hour=end_hour))
        
        result = await self.db.execute(
            select(Appointment).where(
                and_(
                    Appointment.stylist_id == stylist_id,
                    Appointment.date >= start_of_day,
                    Appointment.date < end_of_day,
                    Appointment.status.in_(["pending", "confirmed"])
                )
            )
        )
        booked_appointments = result.scalars().all()
        
        available_slots = []
        current_time = start_of_day
        
        while current_time.hour < end_hour:
            slot_end = current_time + timedelta(minutes=service_duration)
            is_available = True
            
            for appointment in booked_appointments:
                appointment_end = appointment.date + timedelta(minutes=service_duration)
                
                if (current_time < appointment_end and slot_end > appointment.date):
                    is_available = False
                    break
            
            if is_available:
                available_slots.append(current_time.strftime("%H:%M"))
            
            current_time += timedelta(minutes=slot_interval)
        
        return available_slots

    def appointment_to_appointment_in_db_schema(self, appointment: Appointment) -> AppointmentInDB:
        """Convertir modelo a schema"""
        return AppointmentInDB.model_validate(appointment)