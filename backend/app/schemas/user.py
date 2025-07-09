from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str

class UserCreate(UserBase):
    role: str | None = None
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    role: str | None = None
    password: str | None = None

class UserInDB(UserBase):
    id: int
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True # Permite que Pydantic lea datos directamente de un objeto ORM