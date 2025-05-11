from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.schemas import UserDB

async def get_user(session: AsyncSession, username: str):
    result = await session.execute(select(UserDB).where(UserDB.username == username))
    user = result.scalar_one_or_none()
    return user