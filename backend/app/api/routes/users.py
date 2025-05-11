from fastapi import APIRouter, Depends
from typing import Annotated
from app.models.user import User
from app.api.dependencies import deps

router = APIRouter()

@router.get("/me")
async def read_users_me(
    current_user: Annotated[User, Depends(deps.get_current_active_user)],
):
    return current_user