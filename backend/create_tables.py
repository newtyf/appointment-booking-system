import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.db.base import Base

# Importa todos los modelos para que SQLAlchemy los reconozca
from app.models.user import *
from app.models.appointment import *
from app.models.service import *
from app.models.notification import *
from app.models.reminder import *
from app.models.access import *

async def create_tables():
    DATABASE_URL = (
        f"mysql+aiomysql://{settings.MYSQL_DB_USER}:{settings.MYSQL_DB_PASSWORD}"
        f"@{settings.MYSQL_DB_HOST}:{settings.MYSQL_DB_PORT}/{settings.MYSQL_DB_NAME}"
    )
    
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    await engine.dispose()
    print("✅ Tablas creadas exitosamente!")

if __name__ == "__main__":
    asyncio.run(create_tables())