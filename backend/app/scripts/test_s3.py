import os, boto3
from dotenv import load_dotenv
load_dotenv()

s3 = boto3.client("s3", region_name=os.getenv("AWS_REGION"))
bucket = os.getenv("S3_BUCKET")

print("Bucket:", bucket)
print("Region:", os.getenv("AWS_REGION"))

# list top-level keys (may be empty; that's fine)
resp = s3.list_objects_v2(Bucket=bucket, MaxKeys=5)
print("Keys:", [o["Key"] for o in resp.get("Contents", [])])
