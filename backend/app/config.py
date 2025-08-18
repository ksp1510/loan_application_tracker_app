import os

import motor.motor_asyncio  # MongoDB async driver
from dotenv import load_dotenv

# Load environment variables from `.env` file
load_dotenv()

# AWS and S3 Configuration
AWS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET = os.getenv("AWS_SECRET_ACCESS_KEY")
S3_BUCKET = os.getenv("S3_BUCKET")


# MongoDB Configuration
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DB_NAME")

# Database and client setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]
