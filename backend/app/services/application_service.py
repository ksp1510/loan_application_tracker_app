"""
application_service.py
----------------------
Service layer for handling all loan application operations.
Encapsulates database logic, S3 storage coordination, and reporting so
route handlers remain thin.

Notes
-----
- All public functions raise HTTPException with appropriate status codes.
- MongoDB access is async via Motor; ObjectId parsing is validated here.
- S3 paths & MIME validation are delegated to app.utils.file_handler.
"""

from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.constants import FileType
from app.models.model import LoanApplicationBase, LoanApplicationUpdate
from app.utils.db.mongodb import db
from app.utils.file_handler import (
    S3_BUCKET,
    build_s3_key,
    download_file,
    s3_client,
    save_file,
)
from app.utils.helpers import serialize_document, serialize_list
from app.utils.reports.generator import generate_excel_report, generate_pdf_report


# -----------------------------------------------------------------------------
# Query helpers
# -----------------------------------------------------------------------------


async def get_applications(status: str | None = None) -> list[dict]:
    """
    Return all applications, optionally filtered by status.

    Parameters
    ----------
    status : str | None
        Optional status filter (e.g., "APPLIED", "APPROVED", "FUNDED").

    Returns
    -------
    list[dict]
        Serialized documents with stringified _id.
    """
    query = {"status": status} if status else {}
    rows = await db.applications.find(query).to_list(length=None)
    return serialize_list(rows)


async def get_application_by_name(first_name: str, last_name: str) -> dict:
    """
    Find a single application by applicant name (case-insensitive prefix).

    Parameters
    ----------
    first_name : str
    last_name  : str

    Returns
    -------
    dict
        Serialized document.

    Raises
    ------
    HTTPException
        404 if not found.
    """
    query = {
        "main_applicant.first_name": {"$regex": f"^{first_name}", "$options": "i"},
        "main_applicant.last_name": {"$regex": f"^{last_name}", "$options": "i"},
    }
    result = await db.applications.find_one(query)
    if not result:
        raise HTTPException(status_code=404, detail="Application not found") from None
    return serialize_document(result)


# -----------------------------------------------------------------------------
# Create / Update
# -----------------------------------------------------------------------------


async def create_application(application: LoanApplicationBase) -> dict:
    """
    Insert a new application.

    Parameters
    ----------
    application : LoanApplicationBase
        Pydantic model received from the request body.

    Returns
    -------
    dict
        {"id": "<inserted_id>"} on success.
    """
    data = application.model_dump()
    data["application_date"] = datetime.now(timezone.utc)
    res = await db.applications.insert_one(data)
    return {"id": str(res.inserted_id)}


async def update_application(app_id: str, update: LoanApplicationUpdate) -> dict:
    """
    Update an existing application by ID.

    Parameters
    ----------
    app_id : str
        MongoDB ObjectId string.
    update : LoanApplicationUpdate
        Pydantic model with partial fields.

    Returns
    -------
    dict
        {"message": "Application updated"} on success.

    Raises
    ------
    HTTPException
        404 if the document doesn't exist.
    """
    result = await db.applications.update_one(
        {"_id": ObjectId(app_id)},
        {"$set": update.model_dump(exclude_unset=True)},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found") from None
    return {"message": "Application updated"}


# -----------------------------------------------------------------------------
# S3 file operations
# -----------------------------------------------------------------------------

async def _get_app_names(app_id: str) -> tuple[str, str]:
    """
    Resolve applicant first/last names for an application ID.

    Returns
    -------
    tuple[str, str]
        (first_name, last_name)

    Raises
    ------
    HTTPException
        404 if the application doesn't exist.
    """

    doc = await db.applications.find_one({"_id": ObjectId(app_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found") from None
    first = doc.get("main_applicant", {}).get("first_name", "unknown")
    last = doc.get("main_applicant", {}).get("last_name", "unknown")
    return first, last

async def upload_application_file(app_id: str, file: UploadFile, file_type: FileType) -> dict:
    """
    Upload a single file to S3 for a given application.

    S3 key is computed in app.utils.file_handler (see docstring there).

    Parameters
    ----------
    app_id : str
    file : UploadFile
    file_type : FileType

    Returns
    -------
    dict
        Upload receipt with bucket/key.
    """
    first, last = await _get_app_names(app_id)
    return save_file(app_id, file, last, first, file_type)


async def upload_multiple_files(app_id: str, files_map: Dict[str, UploadFile]) -> dict:
    """
    Upload multiple files (possibly different file types) in one call.

    Parameters
    ----------
    app_id : str
    files_map : Dict[str, UploadFile]
        Mapping of file_type string -> UploadFile. Unknown keys are rejected.

    Returns
    -------
    dict
        {"uploaded": [<receipt> ...]}

    Raises
    ------
    HTTPException
        400 for invalid file_type key.
    """
    first, last = await _get_app_names(app_id)
    out = []
    for key, file in files_map.items():
        if not file:
            continue
        try:
            file_type = FileType(key)
        except ValueError as err:
            raise HTTPException(status_code=400, detail=f"Invalid file type: '{key}'.Allowed: {[e.value for e in FileType]}") from err

        out.append(save_file(app_id, file, last, first, file_type))
    return {"uploaded": out}


async def download_application_file(app_id: str, file_type: FileType) -> StreamingResponse:
    """
    Stream a stored PDF back to the client.

    Parameters
    ----------
    app_id : str
    file_type : FileType

    Returns
    -------
    StreamingResponse
        application/pdf content.
    """
    first, last = await _get_app_names(app_id)
    return download_file(app_id, last, first, file_type)


async def list_application_files(app_id: str, file_type: str | None = None) -> list[str]:
    """
    List S3 objects for an application folder.

    Parameters
    ----------
    app_id : str
    file_type : str | None
        Optional filter, e.g., "contract" or "proof_of_address".

    Returns
    -------
    list[str]
        Filenames such as ["contract.pdf", "proof_of_address.pdf"].
    """
    # 1) get applicant names to build the correct S3 folder
    app_doc = await db.applications.find_one({"_id": ObjectId(app_id)})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found") from None

    first = app_doc.get("main_applicant", {}).get("first_name", "unknown")
    last = app_doc.get("main_applicant", {}).get("last_name", "unknown")

    prefix = build_s3_key(app_id, last, first)

    # 2) list with pagination
    keys: list[str] = []
    continuation_token = None

    try:
        while True:
            kwargs = {"Bucket": S3_BUCKET, "Prefix": prefix}
            if continuation_token:
                kwargs["ContinuationToken"] = continuation_token

            resp = s3_client.list_objects_v2(**kwargs)
            contents = resp.get("Contents", [])
            for obj in contents:
                key = obj.get("Key", "")
                if not key or not key.startswith(prefix):
                    continue
                filename = key[len(prefix) :]  # strip folder path -> "contract.pdf"
                if not filename:
                    continue
                if file_type:
                    # allow both with or without .pdf
                    if not (filename == f"{file_type}.pdf" or filename == file_type):
                        continue
                keys.append(filename)

            if resp.get("IsTruncated"):
                continuation_token = resp.get("NextContinuationToken")
            else:
                break

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing S3 files: {str(e)}") from e

    return keys


# -----------------------------------------------------------------------------
# Reporting
# -----------------------------------------------------------------------------

async def generate_report(start_date: str, end_date: str, status: str, format: str) -> bytes:
    """
    Generate a PDF or Excel report for the requested filter.

    Parameters
    ----------
    start_date : str | None
        ISO date (YYYY-MM-DD or full ISO timestamp) lower bound (inclusive).
    end_date   : str | None
        ISO date upper bound (inclusive).
    status     : str | None
        Optional status filter.
    format     : str
        "pdf" or "excel"

    Returns
    -------
    bytes
        Binary report content suitable for StreamingResponse/FileResponse.
    """
    query = {}
    if status:
        query["status"] = status
    if start_date and end_date:
        query["application_date"] = {
            "$gte": datetime.fromisoformat(start_date),
            "$lte": datetime.fromisoformat(end_date),
        }
    data = await db.applications.find(query).to_list(length=None)
    data = [serialize_document(doc) for doc in data]
    if format == "pdf":
        return generate_pdf_report(data)
    return generate_excel_report(data)
