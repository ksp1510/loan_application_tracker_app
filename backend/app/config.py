import os
from dotenv import load_dotenv
import motor.motor_asyncio # type: ignore
import boto3 # type: ignore

# Load environment variables
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://ksp1510:Ksp1510@cluster0.id9hp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DATABASE_NAME = os.getenv("DB_NAME", "Applicants")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]


