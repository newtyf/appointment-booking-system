from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.deps import check_user_role, get_user_service
from app.schemas.user import UserCreate, UserInDB
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}", response_model=UserInDB)
async def read_user(
    user_id: int,
    user_service: Annotated[UserService, Depends(get_user_service)],
    _: Annotated[bool, Depends(check_user_role("admin", "user"))]
):
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_create: UserCreate,
    user_service: Annotated[UserService, Depends(get_user_service)],
    _: Annotated[bool, Depends(check_user_role("admin"))]
):
    db_user = await user_service.get_user_by_email(user_create.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    user = await user_service.create_user(user_create)
    return user
