# app/utils/db/mongodb.py
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import DATABASE_NAME, MONGODB_URL

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]


# Reusable async getter for dependency injection or direct import
async def get_db() -> AsyncIOMotorDatabase:
    return db
