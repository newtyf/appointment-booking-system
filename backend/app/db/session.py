from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.schemas import Base
import os
from dotenv import load_dotenv
load_dotenv()

# Validate environment variables
required_env_vars = ["MYSQL_DB_USER", "MYSQL_DB_PASSWORD", "MYSQL_DB_HOST", "MYSQL_DB_PORT", "MYSQL_DB_NAME"]
missing_vars = [var for var in required_env_vars if not os.getenv(var)]

if missing_vars:
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")

DATABASE_URL = (
    f"mysql+aiomysql://{os.getenv('MYSQL_DB_USER')}:{os.getenv('MYSQL_DB_PASSWORD')}"
    f"@{os.getenv('MYSQL_DB_HOST')}:{os.getenv('MYSQL_DB_PORT')}/{os.getenv('MYSQL_DB_NAME')}"
)

print(DATABASE_URL)

# Create the async engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create the async session factory
async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Dependency to get the session
async def get_session():
    async with async_session() as session:
        yield session
