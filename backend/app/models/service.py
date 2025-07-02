# backend/app/models/service.py
from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(length=100))
    duration_min: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text)

    def __repr__(self):
        return f"<Service(id={self.id}, name='{self.name}')>"
