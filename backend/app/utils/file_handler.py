"""
file_handler.py
---------------
Thin S3 adapter used by the service layer.

Responsibilities
- Build stable S3 keys for application documents.
- Validate basic MIME for uploads (defense-in-depth; FastAPI also checks).
- Upload/download/list objects in the per-application folder.

S3 Key Convention
-----------------
All files for an application live under a single "folder" (key prefix):

    {last_name_lower}_{first_name_lower}_{app_id}/

Filenames are derived from FileType enum and saved as PDF:
    {file_type.value}.pdf

Examples
--------
Folder:
    doe_jane_64f3...9a2/

Objects:
    doe_jane_64f3...9a2/contract.pdf
    doe_jane_64f3...9a2/proof_of_address.pdf
"""

from __future__ import annotations

import io
import os

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.constants import FileType


# --------------------------------------------------------------------------------------
# S3 client & bucket configuration
# --------------------------------------------------------------------------------------

# By default, the SDK will pick credentials/region from env or IAM role.
# Ensure you export: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION
s3_client = boto3.client("s3")

# The bucket name is read from env; set S3_BUCKET in your .env/.env.local
S3_BUCKET = os.getenv("S3_BUCKET", "loan-application-documents-2025")


# --------------------------------------------------------------------------------------
# Key building & validation helpers
# --------------------------------------------------------------------------------------


def build_s3_key(app_id: str, first_name: str, last_name: str, file_type: FileType) -> str:
    """
    Build the canonical S3 object key or key *prefix* for an application.

    Parameters
    ----------
    app_id : str
        MongoDB ObjectId string.
    last_name : str
    first_name : str
    file_type : FileType | None
        If provided, returns full object path including filename.
        If None, returns just the folder prefix.

    Returns
    -------
    str
        Either "{last}_{first}_{id}/" (prefix) or ".../{file_type}.pdf" (object key).
    """
    safe = f"{last_name.lower()}_{first_name.lower()}_{app_id}"
    return f"{safe}/{file_type.value}.pdf"


def validate_mime_type(file: UploadFile) -> None:
    """
    Best-effort MIME/type check. Currently we store files as PDF.

    Raises
    ------
    HTTPException
        415 if the content type is not a known PDF type.
    """
    # Accept the standard & common aliases for PDFs
    allowed = {"application/pdf", "application/x-pdf", "application/acrobat", "applications/pdf"}
    if (file.content_type or "").lower() not in allowed:
        raise HTTPException(status_code=415, detail=f"Only PDF allowed. Got {file.content_type!r}")


# --------------------------------------------------------------------------------------
# Upload / Download
# --------------------------------------------------------------------------------------

def save_file(
    app_id: str, file: UploadFile, last_name: str, first_name: str, file_type: FileType
) -> dict:
    """
    Upload a single file to S3 under the canonical application folder.

    Notes
    -----
    - Validates MIME type before upload.
    - Overwrites if the same file_type is uploaded again.

    Returns
    -------
    dict
        {"message": "...", "bucket": S3_BUCKET, "key": "<s3-key>"}

    Raises
    ------
    HTTPException
        500 for any S3 errors.
    """
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
    """
    Stream a stored PDF from S3.

    Returns
    -------
    StreamingResponse
        'application/pdf' with a Content-Disposition attachment filename.

    Raises
    ------
    HTTPException
        404 if the object doesn't exist
        500 for other S3 errors
    """
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


# --------------------------------------------------------------------------------------
# Listing & deletion
# --------------------------------------------------------------------------------------


def list_files_for_application(app_id: str, last_name: str, first_name: str) -> list[str]:
    """
    List object names in an application's folder (optionally filtered by type).

    Parameters
    ----------
    app_id : str
    first_name : str
    last_name : str
    file_type : FileType | None
        If provided, only returns that single expected filename when present.

    Returns
    -------
    list[str]
        Filenames (no prefix), e.g. ["contract.pdf", "proof_of_address.pdf"]

    Notes
    -----
    - Uses paginated ListObjectsV2 to handle large folders.
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


#Not implemented yet
def delete_application_folder(app_id: str, first_name: str, last_name: str) -> int:
    """
    Delete *all* objects under an application's folder prefix.

    Returns
    -------
    int
        Count of deleted objects.

    Notes
    -----
    - Useful for cascading deletes if you ever add an application DELETE endpoint.
    """
    prefix = build_s3_key(app_id, last_name, first_name, file_type=None)
    deleted = 0
    continuation: str | None = None

    try:
        while True:
            kwargs = {"Bucket": S3_BUCKET, "Prefix": prefix}
            if continuation:
                kwargs["ContinuationToken"] = continuation

            resp = s3_client.list_objects_v2(**kwargs)
            keys = [{"Key": o["Key"]} for o in resp.get("Contents", [])]
            if keys:
                s3_client.delete_objects(Bucket=S3_BUCKET, Delete={"Objects": keys})
                deleted += len(keys)

            if resp.get("IsTruncated"):
                continuation = resp.get("NextContinuationToken")
            else:
                break

        return deleted
    except (BotoCoreError, ClientError) as err:
        raise HTTPException(status_code=500, detail=f"S3 delete error: {err}") from err
