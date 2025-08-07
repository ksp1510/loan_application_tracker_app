import os
import boto3
from fastapi import UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from botocore.exceptions import BotoCoreError, ClientError
import uuid
import io
from app.constants import FileType

s3_client = boto3.client("s3")
S3_BUCKET = os.getenv("S3_BUCKET", "loan-applications-bucket")

ALLOWED_MIME_TYPES = {"application/pdf", "image/png", "image/jpeg"}

# app/utils/validators.py

def validate_file_type(file: UploadFile):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")


# app/utils/s3_upload.py or similar

def save_file(app_id: str, file: UploadFile, applicant_last_name: str, applicant_first_name: str, file_type: FileType):
    try:
        filename = f"{file_type.value}.pdf"
        folder = f"{applicant_last_name.lower()}_{applicant_first_name.lower()}_{app_id}"
        key = f"{folder}/{filename}"

        # Force .pdf extension and validate content-type
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

        s3_client.upload_fileobj(file.file, S3_BUCKET, key)
        return {
            "message": f"{file_type.value} uploaded successfully",
            "filename": filename,
            "s3_key": key
        }
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=f"S3 error: {str(e)}")




def get_file_response(app_id: str, file_type: FileType, applicant_last_name: str, applicant_first_name: str):
    try:
        applicant_name = f"{applicant_last_name.lower()}_{applicant_first_name.lower()}"
        # Ensure we request the same key we saved during upload
        key = f"{applicant_name}_{app_id}/{file_type.value}.pdf"

        file_stream = io.BytesIO()
        s3_client.download_fileobj(S3_BUCKET, key, file_stream)
        file_stream.seek(0)

        filename = f"{file_type.value}.pdf"
        return StreamingResponse(
            file_stream,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except s3_client.exceptions.NoSuchKey:
        raise HTTPException(status_code=404, detail="File not found in S3")
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=f"S3 error: {str(e)}")

