from pydantic import BaseModel, Field
from datetime import datetime

class AppointmentBase(BaseModel):
    client_id: int
    stylist_id: int
    service_id: int
    date: datetime
    status: str

class AppointmentCreate(AppointmentBase):
    created_by: int
    modified_by: int

class AppointmentUpdate(BaseModel):
    date: datetime | None = None
    status: str | None = None
    modified_by: int | None = None

class AppointmentInDB(AppointmentBase):
    id: int
    created_by: int
    modified_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
