from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db_session
from app.services.user_service import UserService

def get_user_service(db: AsyncSession = Depends(get_db_session)) -> UserService:
    return UserService(db)
