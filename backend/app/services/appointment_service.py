from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment
from app.models.user import User
from app.models.service import Service
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentCreateForClient,
    AppointmentCreateWalkIn
)


class AppointmentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _validate_datetime(self, appointment_date: datetime):
        """Validar que la fecha de la cita sea válida"""
        # Asegurarse de que ambas fechas tengan timezone
        now = datetime.now(timezone.utc)
        
        # Si appointment_date no tiene timezone, agregarlo
        if appointment_date.tzinfo is None:
            appointment_date = appointment_date.replace(tzinfo=timezone.utc)
        
        if appointment_date < now:
            raise ValueError("No se pueden agendar citas en el pasado")
        
        # Validar horario de trabajo (8 AM - 8 PM)
        hour = appointment_date.hour
        if hour < 8 or hour >= 20:
            raise ValueError("Las citas deben ser entre las 8:00 AM y 8:00 PM")
        
        return True

    async def _check_stylist_availability(
        self, 
        stylist_id: int, 
        date: datetime, 
        service_id: int,
        exclude_appointment_id: Optional[int] = None
    ):
        """Verificar si el estilista está disponible"""
        # Obtener duración del servicio
        service_result = await self.db.execute(
            select(Service).where(Service.id == service_id)
        )
        service = service_result.scalar_one_or_none()
        
        if not service:
            raise ValueError("Servicio no encontrado")
        
        # Calcular rango de tiempo de la nueva cita
        from datetime import timedelta
        end_time = date + timedelta(minutes=service.duration_min)
        
        # Buscar citas que se traslapen
        query = select(Appointment).where(
            and_(
                Appointment.stylist_id == stylist_id,
                Appointment.status.in_(['pending', 'confirmed']),
                or_(
                    # Nueva cita comienza durante una existente
                    and_(
                        Appointment.date <= date,
                        Appointment.date >= end_time  # Esto debería ser date + duration
                    ),
                    # Nueva cita termina durante una existente
                    and_(
                        Appointment.date <= end_time,
                        Appointment.date >= date
                    )
                )
            )
        )
        
        if exclude_appointment_id:
            query = query.where(Appointment.id != exclude_appointment_id)
        
        result = await self.db.execute(query)
        conflicting_appointment = result.scalar_one_or_none()
        
        if conflicting_appointment:
            raise ValueError(f"El estilista no está disponible en ese horario")
        
        return True

    async def list_appointments(self) -> List[Appointment]:
        """Listar todas las citas (admin/receptionist)"""
        result = await self.db.execute(
            select(Appointment).order_by(Appointment.date.desc())
        )
        return result.scalars().all()

    async def list_user_appointments(self, user_id: int) -> List[Appointment]:
        """Listar citas de un cliente específico"""
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
        """Obtener una cita por ID"""
        result = await self.db.execute(
            select(Appointment).where(Appointment.id == appointment_id)
        )
        return result.scalar_one_or_none()

    async def can_user_access_appointment(
        self, 
        appointment: Appointment, 
        user: User
    ) -> bool:
        """Verificar si un usuario puede acceder a una cita"""
        if user.role in ["admin", "receptionist"]:
            return True
        elif user.role == "stylist" and appointment.stylist_id == user.id:
            return True
        elif user.role == "client" and appointment.client_id == user.id:
            return True
        return False

    async def create_appointment(self, appointment_create: AppointmentCreate) -> Appointment:
        """Crear cita (para admin/receptionist)"""
        # Asegurar que la fecha tenga timezone
        if appointment_create.date.tzinfo is None:
            appointment_create.date = appointment_create.date.replace(tzinfo=timezone.utc)
        
        # Validar fecha
        await self._validate_datetime(appointment_create.date)
        
        # Verificar disponibilidad del estilista
        await self._check_stylist_availability(
            appointment_create.stylist_id,
            appointment_create.date,
            appointment_create.service_id
        )
        
        # Validar que se proporcione client_id O datos de walk-in
        if not appointment_create.client_id and not appointment_create.client_name:
            raise ValueError("Debe proporcionar un client_id o datos de walk-in")
        
        new_appointment = Appointment(
            client_id=appointment_create.client_id,
            client_name=appointment_create.client_name,
            client_phone=appointment_create.client_phone,
            client_email=appointment_create.client_email,
            is_walk_in=appointment_create.is_walk_in,
            stylist_id=appointment_create.stylist_id,
            service_id=appointment_create.service_id,
            date=appointment_create.date,
            status=appointment_create.status,
            created_by=appointment_create.created_by,
            modified_by=appointment_create.modified_by
        )
        
        self.db.add(new_appointment)
        await self.db.commit()
        await self.db.refresh(new_appointment)
        return new_appointment

    async def create_appointment_for_client(
        self,
        appointment_data: AppointmentCreateForClient,
        client_id: int,
        created_by: int
    ) -> Appointment:
        """Cliente crea su propia cita"""
        # Asegurar que la fecha tenga timezone
        if appointment_data.date.tzinfo is None:
            appointment_data.date = appointment_data.date.replace(tzinfo=timezone.utc)
        
        # Validar fecha
        await self._validate_datetime(appointment_data.date)
        
        # Verificar disponibilidad del estilista
        await self._check_stylist_availability(
            appointment_data.stylist_id,
            appointment_data.date,
            appointment_data.service_id
        )
        
        new_appointment = Appointment(
            client_id=client_id,
            client_name=None,
            client_phone=None,
            client_email=None,
            is_walk_in=False,
            stylist_id=appointment_data.stylist_id,
            service_id=appointment_data.service_id,
            date=appointment_data.date,
            status="pending",
            created_by=created_by,
            modified_by=created_by
        )
        
        self.db.add(new_appointment)
        await self.db.commit()
        await self.db.refresh(new_appointment)
        return new_appointment

    async def create_walk_in_appointment(
        self,
        appointment_data: AppointmentCreateWalkIn,
        created_by: int
    ) -> Appointment:
        """Crear cita para walk-in"""
        # Asegurar que la fecha tenga timezone
        if appointment_data.date.tzinfo is None:
            appointment_data.date = appointment_data.date.replace(tzinfo=timezone.utc)
        
        # Validar fecha (walk-ins pueden ser en el momento, así que comentamos esta validación)
        # await self._validate_datetime(appointment_data.date)
        
        # Verificar disponibilidad del estilista
        await self._check_stylist_availability(
            appointment_data.stylist_id,
            appointment_data.date,
            appointment_data.service_id
        )
        
        new_appointment = Appointment(
            client_id=None,
            client_name=appointment_data.client_name,
            client_phone=appointment_data.client_phone or "",
            client_email=appointment_data.client_email,
            is_walk_in=True,
            stylist_id=appointment_data.stylist_id,
            service_id=appointment_data.service_id,
            date=appointment_data.date,
            status=appointment_data.status,
            created_by=created_by,
            modified_by=created_by
        )
        
        self.db.add(new_appointment)
        await self.db.commit()
        await self.db.refresh(new_appointment)
        return new_appointment

    async def update_appointment(
        self,
        appointment_id: int,
        appointment_update: AppointmentUpdate
    ) -> Optional[Appointment]:
        """Actualizar una cita"""
        result = await self.db.execute(
            select(Appointment).where(Appointment.id == appointment_id)
        )
        appointment = result.scalar_one_or_none()
        
        if not appointment:
            return None
        
        # Actualizar campos si se proporcionan
        if appointment_update.date is not None:
            # Asegurar timezone
            if appointment_update.date.tzinfo is None:
                appointment_update.date = appointment_update.date.replace(tzinfo=timezone.utc)
            
            await self._validate_datetime(appointment_update.date)
            await self._check_stylist_availability(
                appointment_update.stylist_id or appointment.stylist_id,
                appointment_update.date,
                appointment_update.service_id or appointment.service_id,
                exclude_appointment_id=appointment_id
            )
            appointment.date = appointment_update.date
        
        if appointment_update.status is not None:
            appointment.status = appointment_update.status
        
        if appointment_update.stylist_id is not None:
            appointment.stylist_id = appointment_update.stylist_id
        
        if appointment_update.service_id is not None:
            appointment.service_id = appointment_update.service_id
        
        if appointment_update.modified_by is not None:
            appointment.modified_by = appointment_update.modified_by
        
        await self.db.commit()
        await self.db.refresh(appointment)
        return appointment

    async def update_appointment_status(
        self,
        appointment_id: int,
        status: str,
        modified_by: int
    ) -> Optional[Appointment]:
        """Cambiar el estado de una cita"""
        result = await self.db.execute(
            select(Appointment).where(Appointment.id == appointment_id)
        )
        appointment = result.scalar_one_or_none()
        
        if not appointment:
            return None
        
        # Validar transiciones de estado válidas
        valid_statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show']
        if status not in valid_statuses:
            raise ValueError(f"Estado inválido: {status}")
        
        appointment.status = status
        appointment.modified_by = modified_by
        
        await self.db.commit()
        await self.db.refresh(appointment)
        return appointment

    async def delete_appointment(self, appointment_id: int) -> bool:
        """Eliminar/Cancelar una cita"""
        result = await self.db.execute(
            select(Appointment).where(Appointment.id == appointment_id)
        )
        appointment = result.scalar_one_or_none()
        
        if not appointment:
            return False
        
        # En lugar de eliminar, cambiar estado a cancelado
        appointment.status = 'cancelled'
        await self.db.commit()
        return True

    async def get_availability(
        self,
        date_str: str,
        service_id: Optional[int] = None,
        stylist_id: Optional[int] = None
    ):
        """Obtener disponibilidad de estilistas para una fecha"""
        from datetime import datetime, timedelta
        
        # Parsear fecha
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Formato de fecha inválido. Use YYYY-MM-DD")
        
        # Generar slots de tiempo (8 AM - 8 PM, cada hora)
        slots = []
        for hour in range(8, 20):
            slot_time = date.replace(hour=hour, minute=0, second=0, microsecond=0)
            slots.append(slot_time)
        
        # Si se especifica un estilista, solo verificar ese
        if stylist_id:
            stylist_result = await self.db.execute(
                select(User).where(User.id == stylist_id)
            )
            stylists = [stylist_result.scalar_one_or_none()]
        else:
            # Obtener todos los estilistas
            stylists_result = await self.db.execute(
                select(User).where(User.role == 'stylist')
            )
            stylists = stylists_result.scalars().all()
        
        availability = []
        
        for stylist in stylists:
            if not stylist:
                continue
            
            # Obtener citas del estilista para ese día
            appointments_result = await self.db.execute(
                select(Appointment).where(
                    and_(
                        Appointment.stylist_id == stylist.id,
                        Appointment.status.in_(['pending', 'confirmed']),
                        Appointment.date >= date,
                        Appointment.date < date + timedelta(days=1)
                    )
                )
            )
            appointments = appointments_result.scalars().all()
            
            # Filtrar slots disponibles
            available_slots = []
            for slot in slots:
                is_available = True
                for appointment in appointments:
                    # Si el slot coincide con una cita existente, no está disponible
                    if appointment.date.hour == slot.hour:
                        is_available = False
                        break
                
                if is_available:
                    available_slots.append(slot.strftime("%H:%M"))
            
            availability.append({
                "stylist_id": stylist.id,
                "stylist_name": stylist.name,
                "available_slots": available_slots
            })
        
        return {
            "date": date_str,
            "service_id": service_id,
            "stylists": availability
        }