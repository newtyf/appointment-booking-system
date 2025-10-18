from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.deps import check_user_role, get_user_service, get_current_user
from app.schemas.user import UserCreate, UserInDB
from app.services.user_service import UserService
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserInDB)
async def get_my_profile(
    current_user: Annotated[User, Depends(get_current_user)]
):
    return current_user


@router.get("", response_model=list[UserInDB])
async def list_users(
    user_service: Annotated[UserService, Depends(get_user_service)],
    _: Annotated[bool, Depends(check_user_role("admin", "receptionist"))]
):
    users = await user_service.get_all_users()
    return users


@router.get("/{user_id}", response_model=UserInDB)
async def read_user(
    user_id: int,
    user_service: Annotated[UserService, Depends(get_user_service)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Obtener información de un usuario por ID.
    - Admin: puede ver cualquier usuario
    - Receptionist: puede ver cualquier usuario (necesita ver clientes)
    - Stylist: solo puede ver su propio perfil
    - Client: solo puede ver su propio perfil
    """
    if current_user.role not in ["admin", "receptionist"]:
        if current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this user"
            )
    
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
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


@router.put("/{user_id}", response_model=UserInDB)
async def update_user(
    user_id: int,
    user_update: UserCreate,
    user_service: Annotated[UserService, Depends(get_user_service)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
    
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if current_user.role != "admin" and user_update.role != user.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to change role"
        )
    
    updated_user = await user_service.update_user(user_id, user_update)
    return updated_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    user_service: Annotated[UserService, Depends(get_user_service)],
    _: Annotated[bool, Depends(check_user_role("admin"))]
):
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await user_service.delete_user(user_id)
    return None