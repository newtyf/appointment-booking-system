from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserInDB

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def get_user(self, user_id: int) -> User | None:
        result = await self.db.execute(select(User).filter(User.id == user_id))
        return result.scalars().first()

    async def get_all_users(self) -> list[User]:
        """Obtener todos los usuarios"""
        result = await self.db.execute(select(User))
        return result.scalars().all()

    async def create_user(self, user: UserCreate) -> User:
        hashed_password = get_password_hash(user.password)
        db_user = User(
            email=user.email,
            name=user.name,
            phone=user.phone,
            role=user.role,
            hashed_password=hashed_password
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    async def update_user(self, user_id: int, user_update: UserUpdate) -> User | None:
        db_user = await self.get_user(user_id)
        if not db_user:
            return None

        update_data = user_update.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if key == "password" and value:
                db_user.hashed_password = get_password_hash(value)
            elif hasattr(db_user, key):
                setattr(db_user, key, value)

        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    async def delete_user(self, user_id: int) -> User | None:
        db_user = await self.get_user(user_id)
        if not db_user:
            return None
        await self.db.delete(db_user)
        await self.db.commit()
        return db_user

    def user_to_user_in_db_schema(self, user: User) -> UserInDB:
        return UserInDB.model_validate(user)