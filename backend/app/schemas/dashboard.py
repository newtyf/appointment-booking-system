from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# COMÚN 

class AppointmentSummary(BaseModel):
    """Resumen de una cita para dashboards"""
    id: int
    client_name: str  # Nombre del cliente (registrado o walk-in)
    stylist_name: str
    service_name: str
    date: datetime
    status: str
    is_walk_in: bool

# ADMIN DASHBOARD 

class AppointmentStats(BaseModel):
    """Estadísticas de citas"""
    total: int
    pending: int
    confirmed: int
    completed: int
    cancelled: int
    no_show: int

class StylistRanking(BaseModel):
    """Ranking de estilista"""
    stylist_id: int
    stylist_name: str
    total_appointments: int
    completed_appointments: int

class ServiceRanking(BaseModel):
    """Ranking de servicio"""
    service_id: int
    service_name: str
    times_booked: int

class AdminDashboard(BaseModel):
    """Dashboard completo para Admin"""
    appointments_stats: AppointmentStats
    total_clients: int
    total_stylists: int
    total_services: int
    top_stylists: List[StylistRanking]
    top_services: List[ServiceRanking]
    walk_in_percentage: float
    recent_appointments: List[AppointmentSummary]  # Últimas 5 citas

# RECEPTIONIST DASHBOARD 

class StylistAvailabilityToday(BaseModel):
    """Disponibilidad de estilista hoy"""
    stylist_id: int
    stylist_name: str
    appointments_today: int
    next_available_slot: Optional[str] = None  # "14:00"

class ReceptionistDashboard(BaseModel):
    """Dashboard para Recepcionista"""
    appointments_today: List[AppointmentSummary]
    pending_confirmations: List[AppointmentSummary]
    stylists_availability: List[StylistAvailabilityToday]
    total_appointments_today: int
    walk_ins_today: int

# STYLIST DASHBOARD 

class NextAppointment(BaseModel):
    """Próxima cita del estilista"""
    id: int
    client_name: str
    service_name: str
    date: datetime
    duration_min: int
    is_walk_in: bool

class StylistDashboard(BaseModel):
    """Dashboard para Estilista"""
    next_appointment: Optional[NextAppointment] = None
    appointments_today: List[AppointmentSummary]
    appointments_upcoming: List[AppointmentSummary]  # Próximos 7 días
    total_completed_this_month: int

# CLIENT DASHBOARD 

class ClientDashboard(BaseModel):
    """Dashboard para Cliente"""
    upcoming_appointments: List[AppointmentSummary]
    past_appointments: List[AppointmentSummary]  
    total_appointments: int
    favorite_service: Optional[str] = None  