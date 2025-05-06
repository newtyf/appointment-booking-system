from fastapi import FastAPI, Depends
from config.db import get_db
from routes.auth import auth
import os
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

app = FastAPI(root_path=os.getenv("API_PREFIX", "/api"), )

app.include_router(auth, prefix="/auth", tags=["auth"])

@app.get("/health")
async def health(db=Depends(get_db)):
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
