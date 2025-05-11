from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.services.user import get_user
from app.core.security import fake_hash_password

router = APIRouter()

@router.post("/token")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    user_db = await get_user(session, form_data.username)
    if not user_db:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    hashed_password = fake_hash_password(form_data.password)
    if not hashed_password == user_db.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    return {"access_token": user_db.username, "token_type": "bearer"}
