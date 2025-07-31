from fastapi import APIRouter, Body, HTTPException, Query, UploadFile, File
from pymongo import MongoClient
from fastapi.responses import FileResponse
import os
import boto3 # type: ignore
from datetime import datetime, timedelta
from backend.app.models.model import LoanApplication
from app.config import table

router = APIRouter()


# Create a new loan application
@router.post("/applications/")
def create_application(application: LoanApplication):
    application_dict = application.dict()
    application_dict["application_id"] = str(datetime.utcnow().timestamp())  # Unique ID
    table.put_item(Item=application_dict)
    return {"message": "Application successfully created", "id": application_dict["application_id"]}

# Get applications with optional name filtering
@router.get("/applications/")
def get_applications(first_name: str = Query(None), last_name: str = Query(None)):
    scan_kwargs = {}
    
    if first_name:
        scan_kwargs["FilterExpression"] = "contains(first_name, :first_name)"
        scan_kwargs["ExpressionAttributeValues"] = {":first_name": first_name}
    
    if last_name:
        scan_kwargs["FilterExpression"] = "contains(last_name, :last_name)"
        scan_kwargs["ExpressionAttributeValues"] = {":last_name": last_name}
    
    response = table.scan(**scan_kwargs) if scan_kwargs else table.scan()
    return response.get("Items", [])

# Update approved amount and status (Dashboard edit)
@router.put("/applications/{application_id}")
def update_application(application_id: str, approved_amount: float = Body(...), status: str = Body(...)):
    response = table.update_item(
        Key={"application_id": application_id},
        UpdateExpression="SET approved_amount = :amount, #st = :status",
        ExpressionAttributeNames={"#st": "status"},
        ExpressionAttributeValues={":amount": approved_amount, ":status": status},
        ReturnValues="UPDATED_NEW"
    )
    if "Attributes" not in response:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application updated successfully"}

# Upload file (to S3 instead of local storage)
s3_client = boto3.client("s3")
S3_BUCKET_NAME = "your-s3-bucket-name"

@router.post("/applications/{application_id}/upload")
def upload_file(application_id: str, file: UploadFile = File(...)):
    s3_key = f"{application_id}/{file.filename}"
    s3_client.upload_fileobj(file.file, S3_BUCKET_NAME, s3_key)
    return {"message": "File uploaded successfully", "file_path": s3_key}

# Download file
@router.get("/applications/{application_id}/download/{filename}")
def download_file(application_id: str, filename: str):
    s3_key = f"{application_id}/{filename}"
    file_url = s3_client.generate_presigned_url("get_object", Params={"Bucket": S3_BUCKET_NAME, "Key": s3_key}, ExpiresIn=3600)
    return {"file_url": file_url}

# Delete file
@router.delete("/applications/{application_id}/delete/{filename}")
def delete_file(application_id: str, filename: str):
    s3_key = f"{application_id}/{filename}"
    s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
    return {"message": "File deleted successfully"}

'''# Create a new loan application
@router.post("/applications/")
def create_application(application: LoanApplication):
    application_dict = application.dict()
    result = db.applications.insert_one(application_dict)
    return {"message": "Application created", "id": str(result.inserted_id)}

# Get applications with optional name filtering
@router.get("/applications/")
def get_applications(first_name: str = Query(None), last_name: str = Query(None)):
    query = {}
    if first_name:
        query["first_name"] = {"$regex": first_name, "$options": "i"}  # Partial match
    if last_name:
        query["last_name"] = {"$regex": last_name, "$options": "i"}  # Partial match

    applications = list(db.applications.find(query, {"_id": 0}))
    return applications

# Update application status
@router.put("/applications/{application_id}/status")
def update_application_status(application_id: str, status: str):
    result = db.applications.update_one({"_id": application_id}, {"$set": {"status": status}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Status updated successfully"}

# Upload file
@router.post("/applications/{application_id}/upload")
def upload_file(application_id: str, file: UploadFile = File(...)):
    file_location = f"uploads/{application_id}_{file.filename}"
    os.makedirs("uploads", exist_ok=True)
    with open(file_location, "wb") as f:
        f.write(file.file.read())
    return {"message": "File uploaded successfully", "file_path": file_location}

# Download file
@router.get("/applications/{application_id}/download/{filename}")
def download_file(application_id: str, filename: str):
    file_path = f"uploads/{application_id}_{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, filename=filename)

# Delete file
@router.delete("/applications/{application_id}/delete/{filename}")
def delete_file(application_id: str, filename: str):
    file_path = f"uploads/{application_id}_{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(file_path)
    return {"message": "File deleted successfully"}'''

