from sqlalchemy import Column, String, Boolean
from app.schemas.base import Base

class UserDB(Base):
    __tablename__ = "users"

    username = Column(String(50), primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    full_name = Column(String(100))
    hashed_password = Column(String(100))
    disabled = Column(Boolean, default=False)