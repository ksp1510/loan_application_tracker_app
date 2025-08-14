import os

import motor.motor_asyncio  # type: ignore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
AWS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET = os.getenv("AWS_SECRET_ACCESS_KEY")
S3_BUCKET = os.getenv("S3_BUCKET", "loan-applications-bucket")


MONGODB_URL = os.getenv(
    "MONGODB_URL",
    "mongodb+srv://ksp1510:Ksp1510@cluster0.id9hp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
)
DATABASE_NAME = os.getenv("DB_NAME", "Applicants")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]
