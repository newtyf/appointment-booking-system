from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.user import User
from app.services import AuthService, RoleChecker, UserService, AppointmentService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_user_service(db: Annotated[AsyncSession, Depends(get_db_session)]) -> UserService:
    return UserService(db)

def get_auth_service(
    db: Annotated[AsyncSession, Depends(get_db_session)],
    user_service: Annotated[UserService, Depends(get_user_service)]
) -> AuthService:
    return AuthService(db, user_service)

def get_appointment_service(db: AsyncSession = Depends(get_db_session)) -> AppointmentService:
    return AppointmentService(db)

# Dependencia para validar si el usuario está autenticado y obtener su información
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
) -> User:
    user = await auth_service.get_user_from_token(token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def check_user_role(*roles: str):
    role_checker = RoleChecker(list(roles))

    def _check_user_role(current_user: Annotated[User, Depends(get_current_user)]):
        # Usamos la instancia de RoleChecker para realizar la comprobación
        if not role_checker.check(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not authorized. Requires one of roles: {', '.join(roles)}"
            )
        return True

    return _check_user_role