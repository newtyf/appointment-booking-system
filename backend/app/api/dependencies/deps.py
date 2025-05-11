from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.services.user import get_user
from app.models.user import UserInDB

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    user_db = await get_user(session, token)
    if not user_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return UserInDB(
        username=user_db.username,
        email=user_db.email,
        full_name=user_db.full_name,
        disabled=user_db.disabled,
        hashed_password=user_db.hashed_password,
    )

async def get_current_active_user(
    current_user: Annotated[UserInDB, Depends(get_current_user)]
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
