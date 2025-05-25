from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: str | None = None
    is_active: bool | None = None

class UserInDB(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True # Permite que Pydantic lea datos directamente de un objeto ORM