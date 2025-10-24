from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import List, Optional

class AppointmentBase(BaseModel):
    """Campos base compartidos"""
    stylist_id: int
    service_id: int
    date: datetime
    status: str = "pending"

class AppointmentCreate(BaseModel):
    """Schema para crear cita (registrado o walk-in)"""
    # Cliente registrado
    client_id: Optional[int] = None
    
    # Cliente walk-in
    client_name: Optional[str] = None
    client_phone: Optional[str] = None
    client_email: Optional[str] = None
    is_walk_in: bool = False
    
    # Datos de la cita
    stylist_id: int
    service_id: int
    date: datetime
    status: str = "pending"
    created_by: Optional[int] = None  # ← AHORA ES OPCIONAL
    modified_by: Optional[int] = None  # ← AHORA ES OPCIONAL
    
    @field_validator('client_id', 'client_name')
    @classmethod
    def validate_client_info(cls, v, info):
        return v

class AppointmentCreateForClient(BaseModel):
    """Cliente crea su propia cita (client_id del token)"""
    stylist_id: int
    service_id: int
    date: datetime

class AppointmentCreateWalkIn(BaseModel):
    """Admin/Receptionist crea cita para walk-in"""
    client_name: str = Field(..., min_length=1, max_length=100)
    client_phone: Optional[str] = Field(None, max_length=20)
    client_email: Optional[str] = None
    stylist_id: int
    service_id: int
    date: datetime
    status: str = "pending"

class AppointmentUpdate(BaseModel):
    """Actualizar cita existente"""
    date: Optional[datetime] = None
    status: Optional[str] = None
    stylist_id: Optional[int] = None
    service_id: Optional[int] = None
    modified_by: Optional[int] = None

class AppointmentInDB(BaseModel):
    """Retornar cita con todos los datos"""
    id: int
    client_id: Optional[int] = None
    client_name: Optional[str] = None
    client_phone: Optional[str] = None
    client_email: Optional[str] = None
    is_walk_in: bool
    stylist_id: int
    service_id: int
    date: datetime
    status: str
    created_by: int
    modified_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AppointmentWithDetails(AppointmentInDB):
    """Schema extendido con nombres completos (futuro)"""
    client_name_full: Optional[str] = None
    stylist_name: Optional[str] = None
    service_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class StylistAvailability(BaseModel):
    """Disponibilidad de un estilista"""
    stylist_id: int
    stylist_name: str
    available_slots: List[str]  # ["09:00", "10:00"]

class AvailabilityResponse(BaseModel):
    """Horarios disponibles por estilista(s)"""
    date: str  # "2025-10-25"
    service_id: Optional[int] = None
    service_name: Optional[str] = None
    service_duration: Optional[int] = None
    stylists: List[StylistAvailability]
    
    class Config:
        from_attributes = True