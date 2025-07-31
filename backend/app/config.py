import os
from dotenv import load_dotenv
import motor.motor_asyncio # type: ignore
import boto3 # type: ignore

# Load environment variables
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DB_NAME", "Applicants")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]


