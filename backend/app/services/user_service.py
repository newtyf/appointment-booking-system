from sqlalchemy.ext.asyncio import AsyncSession  # Importa AsyncSession
from sqlalchemy import select  # Importa select para consultas asíncronas
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserInDB
from app.core.security import fake_hash_password


class UserService:
    def __init__(self, db: AsyncSession):  # Ahora acepta AsyncSession
        self.db = db

    async def get_user_by_email(self, email: str) -> User | None:
        # Usa await y select
        result = await self.db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def get_user(self, user_id: int) -> User | None:
        # Usa await y select
        result = await self.db.execute(select(User).filter(User.id == user_id))
        return result.scalars().first()

    async def create_user(self, user: UserCreate) -> User:
        hashed_password = fake_hash_password(user.password)
        db_user = User(email=user.email, hashed_password=hashed_password)
        self.db.add(db_user)
        await self.db.commit()  # await commit
        await self.db.refresh(db_user)  # await refresh
        return db_user

    async def update_user(self, user_id: int, user_update: UserUpdate) -> User | None:
        db_user = await self.get_user(user_id)  # await get_user
        if not db_user:
            return None

        update_data = user_update.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if key == "password" and value:
                db_user.hashed_password = fake_hash_password(value)
            elif hasattr(db_user, key):
                setattr(db_user, key, value)

        await self.db.commit()  # await commit
        await self.db.refresh(db_user)  # await refresh
        return db_user

    async def delete_user(self, user_id: int) -> User | None:
        db_user = await self.get_user(user_id)  # await get_user
        if not db_user:
            return None
        await self.db.delete(db_user)  # await delete
        await self.db.commit()  # await commit
        return db_user

    def user_to_user_in_db_schema(self, user: User) -> UserInDB:
        return UserInDB.model_validate(user)
