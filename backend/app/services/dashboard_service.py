from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc
from datetime import datetime, timedelta, time
from typing import List, Optional

from app.models.appointment import Appointment
from app.models.user import User
from app.models.service import Service
from app.schemas.dashboard import (
    AppointmentSummary,
    AppointmentStats,
    StylistRanking,
    ServiceRanking,
    AdminDashboard,
    StylistAvailabilityToday,
    ReceptionistDashboard,
    NextAppointment,
    StylistDashboard,
    ClientDashboard
)


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # COMÚN 

    async def _appointment_to_summary(self, appointment: Appointment) -> AppointmentSummary:
        """Convertir Appointment a AppointmentSummary"""
        # Obtener nombres
        stylist = await self.db.get(User, appointment.stylist_id)
        service = await self.db.get(Service, appointment.service_id)
        
        client_name = appointment.client_name if appointment.is_walk_in else None
        if not client_name and appointment.client_id:
            client = await self.db.get(User, appointment.client_id)
            client_name = client.name if client else "Unknown"
        
        return AppointmentSummary(
            id=appointment.id,
            client_name=client_name or "Unknown",
            stylist_name=stylist.name if stylist else "Unknown",
            service_name=service.name if service else "Unknown",
            date=appointment.date,
            status=appointment.status,
            is_walk_in=appointment.is_walk_in
        )

    #  ADMIN DASHBOARD 

    async def get_admin_dashboard(self) -> AdminDashboard:
        """Obtener dashboard completo para admin"""
        
        # Estadísticas de citas
        result = await self.db.execute(select(Appointment))
        all_appointments = result.scalars().all()
        
        appointments_stats = AppointmentStats(
            total=len(all_appointments),
            pending=len([a for a in all_appointments if a.status == "pending"]),
            confirmed=len([a for a in all_appointments if a.status == "confirmed"]),
            completed=len([a for a in all_appointments if a.status == "completed"]),
            cancelled=len([a for a in all_appointments if a.status == "cancelled"]),
            no_show=len([a for a in all_appointments if a.status == "no-show"])
        )
        
        # Total de usuarios
        result = await self.db.execute(select(func.count(User.id)).where(User.role == "client"))
        total_clients = result.scalar()
        
        result = await self.db.execute(select(func.count(User.id)).where(User.role == "stylist"))
        total_stylists = result.scalar()
        
        result = await self.db.execute(select(func.count(Service.id)))
        total_services = result.scalar()
        
        # Top estilistas
        top_stylists = await self._get_top_stylists()
        
        # Top servicios
        top_services = await self._get_top_services()
        
        # Porcentaje walk-in
        walk_ins = len([a for a in all_appointments if a.is_walk_in])
        walk_in_percentage = (walk_ins / len(all_appointments) * 100) if all_appointments else 0
        
        # Citas recientes
        result = await self.db.execute(
            select(Appointment).order_by(desc(Appointment.created_at)).limit(5)
        )
        recent_appointments_models = result.scalars().all()
        recent_appointments = [
            await self._appointment_to_summary(a) for a in recent_appointments_models
        ]
        
        return AdminDashboard(
            appointments_stats=appointments_stats,
            total_clients=total_clients or 0,
            total_stylists=total_stylists or 0,
            total_services=total_services or 0,
            top_stylists=top_stylists,
            top_services=top_services,
            walk_in_percentage=round(walk_in_percentage, 2),
            recent_appointments=recent_appointments
        )

    async def _get_top_stylists(self, limit: int = 5) -> List[StylistRanking]:
        """Obtener ranking de estilistas"""
        result = await self.db.execute(select(User).where(User.role == "stylist"))
        stylists = result.scalars().all()
        
        rankings = []
        for stylist in stylists:
            result = await self.db.execute(
                select(func.count(Appointment.id)).where(Appointment.stylist_id == stylist.id)
            )
            total = result.scalar() or 0
            
            result = await self.db.execute(
                select(func.count(Appointment.id)).where(
                    and_(
                        Appointment.stylist_id == stylist.id,
                        Appointment.status == "completed"
                    )
                )
            )
            completed = result.scalar() or 0
            
            rankings.append(StylistRanking(
                stylist_id=stylist.id,
                stylist_name=stylist.name,
                total_appointments=total,
                completed_appointments=completed
            ))
        
        # Ordenar por total de citas
        rankings.sort(key=lambda x: x.total_appointments, reverse=True)
        return rankings[:limit]

    async def _get_top_services(self, limit: int = 5) -> List[ServiceRanking]:
        """Obtener ranking de servicios"""
        result = await self.db.execute(select(Service))
        services = result.scalars().all()
        
        rankings = []
        for service in services:
            result = await self.db.execute(
                select(func.count(Appointment.id)).where(Appointment.service_id == service.id)
            )
            count = result.scalar() or 0
            
            rankings.append(ServiceRanking(
                service_id=service.id,
                service_name=service.name,
                times_booked=count
            ))
        
        # Ordenar por veces reservado
        rankings.sort(key=lambda x: x.times_booked, reverse=True)
        return rankings[:limit]

    #  RECEPTIONIST DASHBOARD 

    async def get_receptionist_dashboard(self) -> ReceptionistDashboard:
        """Obtener dashboard para recepcionista"""
        today = datetime.now().date()
        start_of_day = datetime.combine(today, time.min)
        end_of_day = datetime.combine(today, time.max)
        
        # Citas de hoy
        result = await self.db.execute(
            select(Appointment).where(
                and_(
                    Appointment.date >= start_of_day,
                    Appointment.date <= end_of_day
                )
            ).order_by(Appointment.date)
        )
        appointments_today_models = result.scalars().all()
        appointments_today = [
            await self._appointment_to_summary(a) for a in appointments_today_models
        ]
        
        # Citas pendientes de confirmar
        result = await self.db.execute(
            select(Appointment).where(
                Appointment.status == "pending"
            ).order_by(Appointment.date).limit(10)
        )
        pending_models = result.scalars().all()
        pending_confirmations = [
            await self._appointment_to_summary(a) for a in pending_models
        ]
        
        # Disponibilidad de estilistas hoy
        stylists_availability = await self._get_stylists_availability_today()
        
        # Totales
        total_appointments_today = len(appointments_today_models)
        walk_ins_today = len([a for a in appointments_today_models if a.is_walk_in])
        
        return ReceptionistDashboard(
            appointments_today=appointments_today,
            pending_confirmations=pending_confirmations,
            stylists_availability=stylists_availability,
            total_appointments_today=total_appointments_today,
            walk_ins_today=walk_ins_today
        )

    async def _get_stylists_availability_today(self) -> List[StylistAvailabilityToday]:
        """Obtener disponibilidad de estilistas hoy"""
        result = await self.db.execute(select(User).where(User.role == "stylist"))
        stylists = result.scalars().all()
        
        today = datetime.now().date()
        start_of_day = datetime.combine(today, time.min)
        end_of_day = datetime.combine(today, time.max)
        
        availability_list = []
        
        for stylist in stylists:
            result = await self.db.execute(
                select(func.count(Appointment.id)).where(
                    and_(
                        Appointment.stylist_id == stylist.id,
                        Appointment.date >= start_of_day,
                        Appointment.date <= end_of_day
                    )
                )
            )
            appointments_today = result.scalar() or 0
            
            # Próximo slot disponible (simplificado)
            next_slot = "Available"  # Aquí podrías calcular el próximo slot real
            
            availability_list.append(StylistAvailabilityToday(
                stylist_id=stylist.id,
                stylist_name=stylist.name,
                appointments_today=appointments_today,
                next_available_slot=next_slot
            ))
        
        return availability_list

    #  STYLIST DASHBOARD 

    async def get_stylist_dashboard(self, stylist_id: int) -> StylistDashboard:
        """Obtener dashboard para estilista"""
        now = datetime.now()
        today = now.date()
        start_of_day = datetime.combine(today, time.min)
        end_of_day = datetime.combine(today, time.max)
        
        # Próxima cita
        result = await self.db.execute(
            select(Appointment).where(
                and_(
                    Appointment.stylist_id == stylist_id,
                    Appointment.date >= now,
                    Appointment.status.in_(["pending", "confirmed"])
                )
            ).order_by(Appointment.date).limit(1)
        )
        next_appointment_model = result.scalar_one_or_none()
        
        next_appointment = None
        if next_appointment_model:
            service = await self.db.get(Service, next_appointment_model.service_id)
            client_name = next_appointment_model.client_name if next_appointment_model.is_walk_in else None
            if not client_name and next_appointment_model.client_id:
                client = await self.db.get(User, next_appointment_model.client_id)
                client_name = client.name if client else "Unknown"
            
            next_appointment = NextAppointment(
                id=next_appointment_model.id,
                client_name=client_name or "Unknown",
                service_name=service.name if service else "Unknown",
                date=next_appointment_model.date,
                duration_min=service.duration_min if service else 30,
                is_walk_in=next_appointment_model.is_walk_in
            )
        
        # Citas de hoy
        result = await self.db.execute(
            select(Appointment).where(
                and_(
                    Appointment.stylist_id == stylist_id,
                    Appointment.date >= start_of_day,
                    Appointment.date <= end_of_day
                )
            ).order_by(Appointment.date)
        )
        appointments_today_models = result.scalars().all()
        appointments_today = [
            await self._appointment_to_summary(a) for a in appointments_today_models
        ]
        
        # Próximas citas (próximos 7 días)
        week_later = now + timedelta(days=7)
        result = await self.db.execute(
            select(Appointment).where(
                and_(
                    Appointment.stylist_id == stylist_id,
                    Appointment.date > end_of_day,
                    Appointment.date <= week_later,
                    Appointment.status.in_(["pending", "confirmed"])
                )
            ).order_by(Appointment.date)
        )
        upcoming_models = result.scalars().all()
        appointments_upcoming = [
            await self._appointment_to_summary(a) for a in upcoming_models
        ]
        
        # Total completadas este mes
        start_of_month = datetime(now.year, now.month, 1)
        result = await self.db.execute(
            select(func.count(Appointment.id)).where(
                and_(
                    Appointment.stylist_id == stylist_id,
                    Appointment.status == "completed",
                    Appointment.date >= start_of_month
                )
            )
        )
        total_completed_this_month = result.scalar() or 0
        
        return StylistDashboard(
            next_appointment=next_appointment,
            appointments_today=appointments_today,
            appointments_upcoming=appointments_upcoming,
            total_completed_this_month=total_completed_this_month
        )

    #  CLIENT DASHBOARD 

    async def get_client_dashboard(self, client_id: int) -> ClientDashboard:
        """Obtener dashboard para cliente"""
        now = datetime.now()
        
        # Próximas citas
        result = await self.db.execute(
            select(Appointment).where(
                and_(
                    Appointment.client_id == client_id,
                    Appointment.date >= now,
                    Appointment.status.in_(["pending", "confirmed"])
                )
            ).order_by(Appointment.date)
        )
        upcoming_models = result.scalars().all()
        upcoming_appointments = [
            await self._appointment_to_summary(a) for a in upcoming_models
        ]
        
        # Citas pasadas (últimas 5)
        result = await self.db.execute(
            select(Appointment).where(
                and_(
                    Appointment.client_id == client_id,
                    Appointment.date < now
                )
            ).order_by(desc(Appointment.date)).limit(5)
        )
        past_models = result.scalars().all()
        past_appointments = [
            await self._appointment_to_summary(a) for a in past_models
        ]
        
        # Total de citas
        result = await self.db.execute(
            select(func.count(Appointment.id)).where(Appointment.client_id == client_id)
        )
        total_appointments = result.scalar() or 0
        
        # Servicio favorito (más usado)
        result = await self.db.execute(
            select(Appointment.service_id, func.count(Appointment.id).label('count'))
            .where(Appointment.client_id == client_id)
            .group_by(Appointment.service_id)
            .order_by(desc('count'))
            .limit(1)
        )
        favorite_service_row = result.first()
        
        favorite_service = None
        if favorite_service_row:
            service = await self.db.get(Service, favorite_service_row[0])
            favorite_service = service.name if service else None
        
        return ClientDashboard(
            upcoming_appointments=upcoming_appointments,
            past_appointments=past_appointments,
            total_appointments=total_appointments,
            favorite_service=favorite_service
        )