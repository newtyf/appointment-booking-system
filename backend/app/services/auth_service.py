from datetime import timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import Login, Token
from app.schemas.user import UserCreate
from app.services.user_service import UserService


class AuthService:
    def __init__(self, db: AsyncSession, user_service: UserService):
        self.db = db
        self.user_service = user_service  # Para interactuar con usuarios

    async def register_user(self, user_create: UserCreate) -> User | None:
        # Verificar si el usuario ya existe
        existing_user = await self.user_service.get_user_by_email(user_create.email)
        if existing_user:
            return None  # O levantar una excepción específica

        # Crear usuario
        hashed_password = get_password_hash(user_create.password)
        db_user = User(email=user_create.email, hashed_password=hashed_password)

        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    async def authenticate_user(self, login_data: Login) -> User | None:
        user = await self.user_service.get_user_by_email(login_data.email)
        if not user or not verify_password(login_data.password, user.hashed_password):
            return None
        return user

    def create_token_for_user(self, user: User) -> Token:
        access_token_expires = timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return Token(access_token=access_token)

    async def get_user_from_token(self, token: str) -> User | None:
        """
        Decodifica el token y busca al usuario en la DB.
        """
        payload = decode_access_token(token)
        if payload is None:
            return None  # Token inválido o expirado

        email = payload.get("sub")
        if email is None:
            return None  # Payload no contiene el subject esperado

        user = await self.user_service.get_user_by_email(email)
        return user
