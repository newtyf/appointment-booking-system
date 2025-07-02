# backend/app/models/user.py
from sqlalchemy import Integer, String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column # Importa estos
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(length=100))
    email: Mapped[str] = mapped_column(String(length=50), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(length=20))
    hashed_password: Mapped[str] = mapped_column(String(length=100))
    role: Mapped[str] = mapped_column(String(length=20), default="user") # Cambiado a str
    created_at: Mapped[DateTime] = mapped_column(DateTime)
    updated_at: Mapped[DateTime] = mapped_column(DateTime)

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"