import os
from dotenv import load_dotenv
from pymongo import MongoClient
import boto3 # type: ignore

# Load environment variables
load_dotenv()

# MongoDB Connection
'''MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://ksp1510:jhSyjXUgQAb9uqNS@cluster0.id9hp.mongodb.net/")
client = MongoClient(MONGO_URI)
db = client.Loans'''

dynamodb = boto3.resource("dynamodb",
                        aws_access_key_id='AKIATP642ZWLPA7WWKVK',
                        aws_secret_access_key='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', 
                        region_name=os.getenv("AWS_REGION", "us-east-1"))  # Default region
table = dynamodb.Table("Loan_Application")

'''Access key: AKIATP642ZWLPA7WWKVK
secret access key: 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
region: us-east-1'''