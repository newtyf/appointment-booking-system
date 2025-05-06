from fastapi import APIRouter

auth = APIRouter()

@auth.get("/login")
def login():
    return {"message": "Login page"}