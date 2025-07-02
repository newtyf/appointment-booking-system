from pydantic import BaseModel
from datetime import datetime

class AccessBase(BaseModel):
    user_id: int
    start_at: datetime
    end_at: datetime
    ip: str

class AccessCreate(AccessBase):
    pass

class AccessUpdate(BaseModel):
    end_at: datetime | None = None
    ip: str | None = None

class AccessInDB(AccessBase):
    id: int

    class Config:
        from_attributes = True
