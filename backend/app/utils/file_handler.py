from __future__ import annotations

import io
import os

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.constants import FileType

s3_client = boto3.client("s3")
S3_BUCKET = os.getenv("S3_BUCKET", "loan-application-documents-2025")


def build_s3_key(app_id: str, first_name: str, last_name: str, file_type: FileType) -> str:
    """
    S3 key format: {last}_{first}_{app_id}/{file_type}.pdf
    E.g., doe_john_6891.../contract.pdf
    """
    safe = f"{last_name.lower()}_{first_name.lower()}_{app_id}"
    return f"{safe}/{file_type.value}.pdf"


def validate_mime_type(file: UploadFile) -> None:
    # Keep as strict/loose as you prefer (this is just an example)
    allowed = {"application/pdf"}
    if (file.content_type or "").lower() not in allowed:
        raise HTTPException(status_code=415, detail=f"Only PDF allowed. Got {file.content_type!r}")


def save_file(
    app_id: str, file: UploadFile, last_name: str, first_name: str, file_type: FileType
) -> dict:
    try:
        validate_mime_type(file)
        key = build_s3_key(app_id, first_name, last_name, file_type)
        s3_client.upload_fileobj(file.file, S3_BUCKET, key)
        return {"message": "File uploaded successfully", "s3_key": key}
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=f"S3 error: {str(e)}") from e


def download_file(
    app_id: str, last_name: str, first_name: str, file_type: FileType
) -> StreamingResponse:
    try:
        key = build_s3_key(app_id, first_name, last_name, file_type)
        file_stream = io.BytesIO()
        s3_client.download_fileobj(S3_BUCKET, key, file_stream)
        file_stream.seek(0)
        return StreamingResponse(
            file_stream,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={file_type.value}.pdf"},
        )
    except s3_client.exceptions.NoSuchKey:
        raise HTTPException(status_code=404, detail="File not found in S3") from None
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=f"S3 error: {str(e)}") from e


def list_files_for_application(app_id: str, last_name: str, first_name: str) -> list[str]:
    """
    Lists keys under {last}_{first}_{app_id}/ prefix.
    Returns just filenames (e.g., 'contract.pdf', 'proof_of_address.pdf').
    """
    prefix = f"{last_name.lower()}_{first_name.lower()}_{app_id}/"
    try:
        resp = s3_client.list_objects_v2(Bucket=S3_BUCKET, Prefix=prefix)
        if "Contents" not in resp:
            return []
        names = []
        for obj in resp["Contents"]:
            key = obj["Key"]
            if key.startswith(prefix):
                names.append(key[len(prefix) :])  # strip folder prefix
        return sorted(names)
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=f"S3 list error: {str(e)}") from e
