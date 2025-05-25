from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import UserInDB, UserCreate
from app.services.user_service import UserService
from app.api.dependencies.deps import get_user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}", response_model=UserInDB)
async def read_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user_service.user_to_user_in_db_schema(user)


@router.post("/", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_create: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    print(user_create)
    db_user = await user_service.get_user_by_email(user_create.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    user = await user_service.create_user(user_create)
    return user_service.user_to_user_in_db_schema(user)
