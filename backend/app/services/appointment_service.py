from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment
from app.models.service import Service
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentInDB,
    AppointmentCreateForClient,
    AppointmentCreateWalkIn
)


class AppointmentService:
    def __init__(self, db: AsyncSession, notification_service=None):
        self.db = db
        self.notification_service = notification_service

    async def list_appointments(self) -> list[AppointmentInDB]:
        """Listar todas las citas"""
        query = select(Appointment).order_by(Appointment.date.desc())
        result = await self.db.execute(query)
        appointments = result.scalars().all()
        
        appointments_with_details = []
        for apt in appointments:
            apt_dict = apt.to_dict()
            
            # Obtener nombre del servicio
            if apt.service_id:
                service_query = select(Service).where(Service.id == apt.service_id)
                service_result = await self.db.execute(service_query)
                service = service_result.scalar_one_or_none()
                apt_dict['service_name'] = service.name if service else None
            
            # Si no es walk-in, obtener nombre del cliente
            if not apt.is_walk_in and apt.client_id:
                client_query = select(User).where(User.id == apt.client_id)
                client_result = await self.db.execute(client_query)
                client = client_result.scalar_one_or_none()
                if client and not apt.client_name:
                    apt_dict['client_name'] = client.name
            
            # Obtener nombre del estilista
            if apt.stylist_id:
                stylist_query = select(User).where(User.id == apt.stylist_id)
                stylist_result = await self.db.execute(stylist_query)
                stylist = stylist_result.scalar_one_or_none()
                apt_dict['stylist_name'] = stylist.name if stylist else None
            
            appointments_with_details.append(AppointmentInDB(**apt_dict))
        
        return appointments_with_details

    async def list_stylist_appointments(self, stylist_id: int) -> list[AppointmentInDB]:
        """Listar citas de un estilista específico"""
        query = (
            select(Appointment)
            .where(Appointment.stylist_id == stylist_id)
            .order_by(Appointment.date.desc())
        )
        result = await self.db.execute(query)
        appointments = result.scalars().all()
        
        appointments_with_details = []
        for apt in appointments:
            apt_dict = apt.to_dict()
            
            # Obtener nombre del servicio
            if apt.service_id:
                service_query = select(Service).where(Service.id == apt.service_id)
                service_result = await self.db.execute(service_query)
                service = service_result.scalar_one_or_none()
                apt_dict['service_name'] = service.name if service else None
            
            # Si no es walk-in, obtener nombre del cliente
            if not apt.is_walk_in and apt.client_id:
                client_query = select(User).where(User.id == apt.client_id)
                client_result = await self.db.execute(client_query)
                client = client_result.scalar_one_or_none()
                if client and not apt.client_name:
                    apt_dict['client_name'] = client.name
            
            appointments_with_details.append(AppointmentInDB(**apt_dict))
        
        return appointments_with_details

    async def list_user_appointments(self, user_id: int) -> list[AppointmentInDB]:
        """Listar citas de un cliente específico"""
        query = (
            select(Appointment)
            .where(Appointment.client_id == user_id)
            .order_by(Appointment.date.desc())
        )
        result = await self.db.execute(query)
        appointments = result.scalars().all()
        
        appointments_with_details = []
        for apt in appointments:
            apt_dict = apt.to_dict()
            
            # Obtener nombre del servicio
            if apt.service_id:
                service_query = select(Service).where(Service.id == apt.service_id)
                service_result = await self.db.execute(service_query)
                service = service_result.scalar_one_or_none()
                apt_dict['service_name'] = service.name if service else None
            
            # Obtener nombre del estilista
            if apt.stylist_id:
                stylist_query = select(User).where(User.id == apt.stylist_id)
                stylist_result = await self.db.execute(stylist_query)
                stylist = stylist_result.scalar_one_or_none()
                apt_dict['stylist_name'] = stylist.name if stylist else None
            
            appointments_with_details.append(AppointmentInDB(**apt_dict))
        
        return appointments_with_details

    async def get_appointment(self, appointment_id: int) -> Optional[AppointmentInDB]:
        """Obtener una cita por ID"""
        query = select(Appointment).where(Appointment.id == appointment_id)
        result = await self.db.execute(query)
        appointment = result.scalar_one_or_none()
        
        if not appointment:
            return None
        
        apt_dict = appointment.to_dict()
        
        # Obtener nombre del servicio
        if appointment.service_id:
            service_query = select(Service).where(Service.id == appointment.service_id)
            service_result = await self.db.execute(service_query)
            service = service_result.scalar_one_or_none()
            apt_dict['service_name'] = service.name if service else None
        
        # Si no es walk-in, obtener nombre del cliente
        if not appointment.is_walk_in and appointment.client_id:
            client_query = select(User).where(User.id == appointment.client_id)
            client_result = await self.db.execute(client_query)
            client = client_result.scalar_one_or_none()
            if client and not appointment.client_name:
                apt_dict['client_name'] = client.name
        
        # Obtener nombre del estilista
        if appointment.stylist_id:
            stylist_query = select(User).where(User.id == appointment.stylist_id)
            stylist_result = await self.db.execute(stylist_query)
            stylist = stylist_result.scalar_one_or_none()
            apt_dict['stylist_name'] = stylist.name if stylist else None
        
        return AppointmentInDB(**apt_dict)

    async def create_appointment(self, appointment_data: AppointmentCreate) -> AppointmentInDB:
        """Crear una nueva cita (registrado o walk-in)"""
        
        # Validar disponibilidad
        is_available = await self._check_availability(
            stylist_id=appointment_data.stylist_id,
            appointment_date=appointment_data.date,
            service_id=appointment_data.service_id
        )
        
        if not is_available:
            raise ValueError("El horario no está disponible")
        
        # Crear la cita
        new_appointment = Appointment(
            client_id=appointment_data.client_id,
            client_name=appointment_data.client_name,
            client_phone=appointment_data.client_phone,
            client_email=appointment_data.client_email,
            is_walk_in=appointment_data.is_walk_in,
            stylist_id=appointment_data.stylist_id,
            service_id=appointment_data.service_id,
            date=appointment_data.date,
            status=appointment_data.status or "pending",
            created_by=appointment_data.created_by,
            modified_by=appointment_data.modified_by
        )
        
        self.db.add(new_appointment)
        await self.db.commit()
        await self.db.refresh(new_appointment)
        
        return await self.get_appointment(new_appointment.id)

    async def create_appointment_for_client(
        self,
        appointment_data: AppointmentCreateForClient,
        client_id: int,
        created_by: int
    ) -> AppointmentInDB:
        """Cliente crea su propia cita"""
        
        # Obtener datos del cliente
        client_query = select(User).where(User.id == client_id)
        result = await self.db.execute(client_query)
        client = result.scalar_one_or_none()
        
        if not client:
            raise ValueError("Cliente no encontrado")
        
        # Crear AppointmentCreate con los datos del cliente
        appointment_create = AppointmentCreate(
            client_id=client_id,
            client_name=client.name,
            client_phone=client.phone,
            client_email=client.email,
            is_walk_in=False,
            stylist_id=appointment_data.stylist_id,
            service_id=appointment_data.service_id,
            date=appointment_data.date,
            status="pending",
            created_by=created_by,
            modified_by=created_by
        )
        
        return await self.create_appointment(appointment_create)

    async def create_walk_in_appointment(
        self,
        appointment_data: AppointmentCreateWalkIn,
        created_by: int
    ) -> AppointmentInDB:
        """Crear cita para cliente walk-in"""
        
        appointment_create = AppointmentCreate(
            client_id=None,
            client_name=appointment_data.client_name,
            client_phone=appointment_data.client_phone,
            client_email=appointment_data.client_email,
            is_walk_in=True,
            stylist_id=appointment_data.stylist_id,
            service_id=appointment_data.service_id,
            date=appointment_data.date,
            status="confirmed",
            created_by=created_by,
            modified_by=created_by
        )
        
        return await self.create_appointment(appointment_create)

    async def update_appointment(
        self,
        appointment_id: int,
        appointment_data: AppointmentUpdate
    ) -> AppointmentInDB:
        """Actualizar una cita existente"""
        query = select(Appointment).where(Appointment.id == appointment_id)
        result = await self.db.execute(query)
        appointment = result.scalar_one_or_none()
        
        if not appointment:
            raise ValueError("Cita no encontrada")
        
        # Actualizar solo los campos proporcionados
        update_data = appointment_data.model_dump(exclude_unset=True)
        
        # Si se actualiza la fecha, verificar disponibilidad
        if "date" in update_data or "stylist_id" in update_data or "service_id" in update_data:
            new_date = update_data.get("date", appointment.date)
            new_stylist = update_data.get("stylist_id", appointment.stylist_id)
            new_service = update_data.get("service_id", appointment.service_id)
            
            is_available = await self._check_availability(
                stylist_id=new_stylist,
                appointment_date=new_date,
                service_id=new_service,
                exclude_appointment_id=appointment_id
            )
            
            if not is_available:
                raise ValueError("El horario no está disponible")
        
        for key, value in update_data.items():
            setattr(appointment, key, value)
        
        await self.db.commit()
        await self.db.refresh(appointment)
        
        return await self.get_appointment(appointment.id)

    async def update_appointment_status(
        self,
        appointment_id: int,
        status: str,
        modified_by: int
    ) -> AppointmentInDB:
        """Actualizar el estado de una cita"""
        query = select(Appointment).where(Appointment.id == appointment_id)
        result = await self.db.execute(query)
        appointment = result.scalar_one_or_none()
        
        if not appointment:
            raise ValueError("Cita no encontrada")
        
        valid_statuses = ["pending", "confirmed", "completed", "cancelled", "no-show"]
        if status not in valid_statuses:
            raise ValueError(f"Estado inválido. Debe ser uno de: {', '.join(valid_statuses)}")
        
        appointment.status = status
        appointment.modified_by = modified_by
        
        await self.db.commit()
        await self.db.refresh(appointment)
        
        return await self.get_appointment(appointment.id)

    async def delete_appointment(self, appointment_id: int) -> None:
        """Cancelar (eliminar) una cita"""
        query = select(Appointment).where(Appointment.id == appointment_id)
        result = await self.db.execute(query)
        appointment = result.scalar_one_or_none()
        
        if not appointment:
            raise ValueError("Cita no encontrada")
        
        appointment.status = "cancelled"
        await self.db.commit()

    async def can_user_access_appointment(self, appointment: AppointmentInDB, user: User) -> bool:
        """Verificar si un usuario puede acceder a una cita"""
        if user.role in ["admin", "receptionist"]:
            return True
        elif user.role == "stylist":
            return appointment.stylist_id == user.id
        elif user.role == "client":
            return appointment.client_id == user.id
        return False

    async def get_availability(
        self,
        date_str: str,
        service_id: Optional[int] = None,
        stylist_id: Optional[int] = None
    ) -> dict:
        """Obtener disponibilidad de horarios"""
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Formato de fecha inválido. Use YYYY-MM-DD")
        
        # Obtener duración del servicio si se proporciona
        service_duration = 60  # Por defecto 60 minutos
        if service_id:
            service_query = select(Service).where(Service.id == service_id)
            result = await self.db.execute(service_query)
            service = result.scalar_one_or_none()
            if service:
                service_duration = service.duration
        
        # Horarios de trabajo (9 AM - 6 PM)
        work_start = datetime.combine(date, datetime.min.time().replace(hour=9))
        work_end = datetime.combine(date, datetime.min.time().replace(hour=18))
        
        # Generar slots de tiempo
        all_slots = []
        current = work_start
        while current < work_end:
            all_slots.append(current)
            current += timedelta(minutes=30)
        
        # Obtener citas existentes
        query = select(Appointment).where(
            func.date(Appointment.date) == date,
            or_(
                Appointment.status == 'pending',
                Appointment.status == 'confirmed'
            )
        )
        
        if stylist_id:
            query = query.where(Appointment.stylist_id == stylist_id)
        
        result = await self.db.execute(query)
        existing_appointments = result.scalars().all()
        
        # Marcar slots ocupados
        available_slots = []
        for slot in all_slots:
            is_available = True
            slot_end = slot + timedelta(minutes=service_duration)
            
            for apt in existing_appointments:
                apt_date = apt.date
                
                # Obtener duración del servicio de la cita
                apt_duration = 60
                if apt.service_id:
                    service_query = select(Service).where(Service.id == apt.service_id)
                    service_result = await self.db.execute(service_query)
                    service = service_result.scalar_one_or_none()
                    if service:
                        apt_duration = service.duration
                
                apt_end = apt_date + timedelta(minutes=apt_duration)
                
                # Verificar si hay solapamiento
                if (slot < apt_end and slot_end > apt_date):
                    is_available = False
                    break
            
            if is_available:
                available_slots.append(slot.strftime("%H:%M"))
        
        return {
            "date": date_str,
            "available_slots": available_slots
        }

    async def get_stylist_dashboard(self, stylist_id: int) -> dict:
        """Dashboard para estilista"""
        now = datetime.now()
        today_start = datetime.combine(now.date(), datetime.min.time())
        today_end = datetime.combine(now.date(), datetime.max.time())
        
        # Próxima cita
        next_appointment = await self._get_next_appointment(stylist_id)
        
        # Citas de hoy
        today_query = (
            select(Appointment)
            .where(
                Appointment.stylist_id == stylist_id,
                Appointment.date >= today_start,
                Appointment.date <= today_end
            )
            .order_by(Appointment.date)
        )
        result = await self.db.execute(today_query)
        appointments_today_raw = result.scalars().all()
        
        appointments_today = []
        for apt in appointments_today_raw:
            apt_dict = apt.to_dict()
            
            # Obtener nombre del servicio
            if apt.service_id:
                service_query = select(Service).where(Service.id == apt.service_id)
                service_result = await self.db.execute(service_query)
                service = service_result.scalar_one_or_none()
                apt_dict['service_name'] = service.name if service else None
            
            # Si no es walk-in, obtener nombre del cliente
            if not apt.is_walk_in and apt.client_id:
                client_query = select(User).where(User.id == apt.client_id)
                client_result = await self.db.execute(client_query)
                client = client_result.scalar_one_or_none()
                if client and not apt.client_name:
                    apt_dict['client_name'] = client.name
            
            appointments_today.append(apt_dict)
        
        # Próximas citas (próximos 7 días)
        next_week = now + timedelta(days=7)
        upcoming_query = (
            select(Appointment)
            .where(
                Appointment.stylist_id == stylist_id,
                Appointment.date > today_end,
                Appointment.date <= next_week,
                or_(
                    Appointment.status == 'pending',
                    Appointment.status == 'confirmed'
                )
            )
            .order_by(Appointment.date)
        )
        result = await self.db.execute(upcoming_query)
        upcoming_raw = result.scalars().all()
        
        upcoming_appointments = []
        for apt in upcoming_raw:
            apt_dict = apt.to_dict()
            
            # Obtener nombre del servicio
            if apt.service_id:
                service_query = select(Service).where(Service.id == apt.service_id)
                service_result = await self.db.execute(service_query)
                service = service_result.scalar_one_or_none()
                apt_dict['service_name'] = service.name if service else None
            
            # Si no es walk-in, obtener nombre del cliente
            if not apt.is_walk_in and apt.client_id:
                client_query = select(User).where(User.id == apt.client_id)
                client_result = await self.db.execute(client_query)
                client = client_result.scalar_one_or_none()
                if client and not apt.client_name:
                    apt_dict['client_name'] = client.name
            
            upcoming_appointments.append(apt_dict)
        
        # Citas completadas este mes
        month_start = datetime.combine(now.replace(day=1).date(), datetime.min.time())
        completed_query = select(func.count(Appointment.id)).where(
            Appointment.stylist_id == stylist_id,
            Appointment.status == "completed",
            Appointment.date >= month_start
        )
        result = await self.db.execute(completed_query)
        completed_count = result.scalar()
        
        return {
            "next_appointment": next_appointment,
            "appointments_today": appointments_today,
            "total_appointments_today": len(appointments_today),
            "upcoming_appointments": upcoming_appointments,
            "completed_this_month": completed_count
        }

    async def get_stylist_history(self, stylist_id: int) -> list[AppointmentInDB]:
        """Obtener historial de citas del estilista (completadas, canceladas, no-show)"""
        query = (
            select(Appointment)
            .where(
                and_(
                    Appointment.stylist_id == stylist_id,
                    or_(
                        Appointment.status == 'completed',
                        Appointment.status == 'cancelled',
                        Appointment.status == 'no-show'
                    )
                )
            )
            .order_by(Appointment.date.desc())
        )
        
        result = await self.db.execute(query)
        appointments = result.scalars().all()
        
        # Agregar nombres de servicio y cliente
        appointments_with_details = []
        for apt in appointments:
            apt_dict = apt.to_dict()
            
            # Obtener nombre del servicio
            if apt.service_id:
                service_query = select(Service).where(Service.id == apt.service_id)
                service_result = await self.db.execute(service_query)
                service = service_result.scalar_one_or_none()
                apt_dict['service_name'] = service.name if service else None
            
            # Si no es walk-in, obtener nombre del cliente
            if not apt.is_walk_in and apt.client_id:
                client_query = select(User).where(User.id == apt.client_id)
                client_result = await self.db.execute(client_query)
                client = client_result.scalar_one_or_none()
                if client and not apt.client_name:
                    apt_dict['client_name'] = client.name
            
            appointments_with_details.append(AppointmentInDB(**apt_dict))
        
        return appointments_with_details

    async def get_client_history(self, client_id: int) -> list[AppointmentInDB]:
        """Obtener historial de citas del cliente (completadas, canceladas, no-show)"""
        query = (
            select(Appointment)
            .where(
                and_(
                    Appointment.client_id == client_id,
                    or_(
                        Appointment.status == 'completed',
                        Appointment.status == 'cancelled',
                        Appointment.status == 'no-show'
                    )
                )
            )
            .order_by(Appointment.date.desc())
        )
        
        result = await self.db.execute(query)
        appointments = result.scalars().all()
        
        # Agregar nombres de servicio y estilista
        appointments_with_details = []
        for apt in appointments:
            apt_dict = apt.to_dict()
            
            # Obtener nombre del servicio
            if apt.service_id:
                service_query = select(Service).where(Service.id == apt.service_id)
                service_result = await self.db.execute(service_query)
                service = service_result.scalar_one_or_none()
                apt_dict['service_name'] = service.name if service else None
            
            # Obtener nombre del estilista
            if apt.stylist_id:
                stylist_query = select(User).where(User.id == apt.stylist_id)
                stylist_result = await self.db.execute(stylist_query)
                stylist = stylist_result.scalar_one_or_none()
                apt_dict['stylist_name'] = stylist.name if stylist else None
            
            appointments_with_details.append(AppointmentInDB(**apt_dict))
        
        return appointments_with_details

    async def _get_next_appointment(self, stylist_id: int) -> Optional[AppointmentInDB]:
        """Obtener la próxima cita del estilista"""
        now = datetime.now()
        
        query = (
            select(Appointment)
            .where(
                Appointment.stylist_id == stylist_id,
                Appointment.date >= now,
                or_(
                    Appointment.status == 'pending',
                    Appointment.status == 'confirmed'
                )
            )
            .order_by(Appointment.date)
            .limit(1)
        )
        
        result = await self.db.execute(query)
        appointment = result.scalar_one_or_none()
        
        if not appointment:
            return None
        
        apt_dict = appointment.to_dict()
        
        # Obtener nombre del servicio
        if appointment.service_id:
            service_query = select(Service).where(Service.id == appointment.service_id)
            service_result = await self.db.execute(service_query)
            service = service_result.scalar_one_or_none()
            apt_dict['service_name'] = service.name if service else None
        
        # Si no es walk-in, obtener nombre del cliente
        if not appointment.is_walk_in and appointment.client_id:
            client_query = select(User).where(User.id == appointment.client_id)
            client_result = await self.db.execute(client_query)
            client = client_result.scalar_one_or_none()
            if client and not appointment.client_name:
                apt_dict['client_name'] = client.name
        
        return AppointmentInDB(**apt_dict)

    async def _check_availability(
        self,
        stylist_id: int,
        appointment_date: datetime,
        service_id: int,
        exclude_appointment_id: Optional[int] = None
    ) -> bool:
        """Verificar si un horario está disponible"""
        
        # Obtener duración del servicio
        service_query = select(Service).where(Service.id == service_id)
        result = await self.db.execute(service_query)
        service = result.scalar_one_or_none()
        
        if not service:
            raise ValueError("Servicio no encontrado")
        
        service_duration = service.duration
        appointment_end = appointment_date + timedelta(minutes=service_duration)
        
        # Buscar citas que se solapen
        query = select(Appointment).where(
            Appointment.stylist_id == stylist_id,
            or_(
                Appointment.status == 'pending',
                Appointment.status == 'confirmed'
            ),
            Appointment.date < appointment_end
        )
        
        if exclude_appointment_id:
            query = query.where(Appointment.id != exclude_appointment_id)
        
        result = await self.db.execute(query)
        existing_appointments = result.scalars().all()
        
        for apt in existing_appointments:
            # Obtener duración del servicio de la cita existente
            apt_service_query = select(Service).where(Service.id == apt.service_id)
            apt_service_result = await self.db.execute(apt_service_query)
            apt_service = apt_service_result.scalar_one_or_none()
            
            apt_duration = apt_service.duration if apt_service else 60
            apt_end = apt.date + timedelta(minutes=apt_duration)
            
            # Verificar solapamiento
            if appointment_date < apt_end and appointment_end > apt.date:
                return False
        
        return True