import os
import boto3
from fastapi import UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from botocore.exceptions import BotoCoreError, ClientError
import uuid
import io

s3_client = boto3.client("s3")
S3_BUCKET = os.getenv("S3_BUCKET", "loan-applications-bucket")

def save_file(app_id: str, file: UploadFile, applicant_last_name: str):
    try:
        key = f"{applicant_last_name}/{app_id}/{file.filename}"
        s3_client.upload_fileobj(file.file, S3_BUCKET, key)
        return {"message": "File uploaded successfully", "filename": file.filename, "s3_key": key}
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_file_response(app_id: str, filename: str, applicant_last_name: str):
    try:
        key = f"{applicant_last_name}/{app_id}/{filename}"
        file_stream = io.BytesIO()
        s3_client.download_fileobj(S3_BUCKET, key, file_stream)
        file_stream.seek(0)
        return StreamingResponse(file_stream, headers={"Content-Disposition": f"attachment; filename={filename}"})
    except s3_client.exceptions.NoSuchKey:
        raise HTTPException(status_code=404, detail="File not found")
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=str(e))