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


async def get_applications(status: str | None = None) -> list[dict]:
    query = {"status": status} if status else {}
    rows = await db.applications.find(query).to_list(length=None)
    return serialize_list(rows)


async def get_application_by_name(first_name: str, last_name: str) -> dict:
    query = {
        "main_applicant.first_name": {"$regex": f"^{first_name}", "$options": "i"},
        "main_applicant.last_name": {"$regex": f"^{last_name}", "$options": "i"},
    }
    result = await db.applications.find_one(query)
    if not result:
        raise HTTPException(status_code=404, detail="Application not found") from None
    return serialize_document(result)


async def create_application(application: LoanApplicationBase) -> dict:
    data = application.model_dump()
    data["application_date"] = datetime.now(timezone.utc)
    res = await db.applications.insert_one(data)
    return {"id": str(res.inserted_id)}


async def update_application(app_id: str, update: LoanApplicationUpdate) -> dict:
    result = await db.applications.update_one(
        {"_id": ObjectId(app_id)},
        {"$set": update.model_dump(exclude_unset=True)},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found") from None
    return {"message": "Application updated"}


async def _get_app_names(app_id: str) -> tuple[str, str]:
    doc = await db.applications.find_one({"_id": ObjectId(app_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found") from None
    first = doc.get("main_applicant", {}).get("first_name", "unknown")
    last = doc.get("main_applicant", {}).get("last_name", "unknown")
    return first, last


async def upload_application_file(app_id: str, file: UploadFile, file_type: FileType) -> dict:
    app_doc = await db.applications.find_one({"_id": ObjectId(app_id)})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found") from None
    first = app_doc.get("main_applicant", {}).get("first_name", "unknown")
    last = app_doc.get("main_applicant", {}).get("last_name", "unknown")
    return save_file(app_id, file, last, first, file_type)


async def upload_multiple_files(app_id: str, files_map: Dict[str, UploadFile]) -> dict:
    app_doc = await db.applications.find_one({"_id": ObjectId(app_id)})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found") from None
    first = app_doc.get("main_applicant", {}).get("first_name", "unknown")
    last = app_doc.get("main_applicant", {}).get("last_name", "unknown")
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
    app_doc = await db.applications.find_one({"_id": ObjectId(app_id)})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found") from None
    first = app_doc.get("main_applicant", {}).get("first_name", "unknown")
    last = app_doc.get("main_applicant", {}).get("last_name", "unknown")
    return download_file(app_id, last, first, file_type)


async def list_application_files(app_id: str, file_type: str | None = None) -> list[str]:
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


async def generate_report(start_date: str, end_date: str, status: str, format: str) -> bytes:
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
