from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated

from app.schemas.auth import Login, Token # Esquemas para autenticación
from app.schemas.user import UserCreate, UserInDB # Esquemas para registro
from app.services.auth_service import AuthService
from app.api.dependencies.deps import get_auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def register_user_endpoint(
    user_create: UserCreate,
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
):
    user = await auth_service.register_user(user_create)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    # Asumimos que AuthService tiene un user_to_user_in_db_schema o FastAPI lo mapeará
    return user

@router.post("/login", response_model=Token)
async def login_for_access_token(
    login_data: Login,
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
):
    user = await auth_service.authenticate_user(login_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth_service.create_token_for_user(user)
    return token