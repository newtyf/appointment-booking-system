# backend/app/models/user.py
from sqlalchemy import Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column # Importa estos
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    # Usamos Mapped[tipo_python] para el type hint
    # y mapped_column para la definición de la columna de SQLAlchemy
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(length=50), unique=True, index=True)
    role: Mapped[str] = mapped_column(String(length=20), default="user") # Cambiado a str
    hashed_password: Mapped[str] = mapped_column(String(length=100)) # Ahora el type hint es str
    is_active: Mapped[bool] = mapped_column(Boolean, default=True) # También para boolean

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"