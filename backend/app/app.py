from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from app.api.routes import auth, users
from app.core.config import settings
from app.db.base import Base
from app.db.session import sessionmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with sessionmanager.connect() as conn:
        if settings.ENVIRONMENT == "development":
            await conn.run_sync(Base.metadata.create_all)
    yield
    await sessionmanager.close()

app = FastAPI(root_path=settings.API_PREFIX, lifespan=lifespan)

app.include_router(users.router)
app.include_router(auth.router)

@app.get("/health")
async def health():
    """
    Health check endpoint to verify if the API is running healthy.
    """
    async with sessionmanager.connect() as conn:
        # Perform a simple query to check the database connection
        result = await conn.execute(text("SELECT 1"))
        if result.scalar() != 1:
            return {"status": "unhealthy"}
    return {"status": "healthy"}
