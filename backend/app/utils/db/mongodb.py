# app/utils/db/mongodb.py
import motor.motor_asyncio
from app.config import MONGODB_URL, DATABASE_NAME

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Reusable async getter for dependency injection or direct import
async def get_db():
    return db