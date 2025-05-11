from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from app.db.session import init_db, get_session
from app.api.routes import auth, users
import os
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(root_path=os.getenv("API_PREFIX", "/api"), lifespan=lifespan)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["auth"])

@app.get("/health")
async def health(db=Depends(get_session)):
    """
    Health check endpoint to verify if the API is running and the database connection is healthy.
    """
    try:
        # Execute a simple query to check database connectivity
        result = await db.execute(text("SELECT 1"))
        if result.scalar() != 1:
            raise Exception("Unexpected result from database query")
    except Exception as e:
        # If there is an error, return a 500 response with the error message
        return {"status": "unhealthy", "error": str(e)}
    # If the query is successful, return a 200 response
    # with a healthy status
    return {"status": "healthy"}
