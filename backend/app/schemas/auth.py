from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: EmailStr | None = None # El email es el "subject" del token

class Login(BaseModel):
    email: EmailStr
    password: str