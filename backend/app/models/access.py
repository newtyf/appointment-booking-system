# backend/app/models/access.py
from sqlalchemy import Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Access(Base):
    __tablename__ = "accesses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    start_at: Mapped[DateTime] = mapped_column(DateTime)
    end_at: Mapped[DateTime] = mapped_column(DateTime)
    ip: Mapped[str] = mapped_column(String(length=45))

    def __repr__(self):
        return f"<Access(id={self.id}, user_id={self.user_id}, ip='{self.ip}')>"
