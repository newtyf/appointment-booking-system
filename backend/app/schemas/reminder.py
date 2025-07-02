from pydantic import BaseModel
from datetime import datetime

class ReminderBase(BaseModel):
    appointment_id: int
    sent: bool
    sent_at: datetime | None = None

class ReminderCreate(ReminderBase):
    pass

class ReminderUpdate(BaseModel):
    sent: bool | None = None
    sent_at: datetime | None = None

class ReminderInDB(ReminderBase):
    id: int

    class Config:
        from_attributes = True
