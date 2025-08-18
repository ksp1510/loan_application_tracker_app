"""
application_routes.py
---------------------
HTTP routes for the Loan Application Tracker backend.

This module is intentionally thin: it validates & parses request inputs,
delegates business logic to the service layer, and shapes HTTP responses.

Conventions used:
- All DB access is done through the ApplicationService (service layer).
- Use Annotated[... , Depends/Query/File] to satisfy Ruff rule B008.
- Non-default parameters must appear before defaulted ones.
- Keep responses JSON-serializable; ObjectIds are stringified in the service.
"""


import io
from datetime import datetime
from typing import Annotated, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.constants import FileType
from app.models.model import LoanApplicationBase, LoanApplicationUpdate
from app.services import application_service
from app.utils.db.mongodb import get_db
from app.utils.file_handler import S3_BUCKET, download_file, s3_client
from app.utils.helpers import serialize_document
from app.utils.reports.generator import generate_excel_report, generate_pdf_report

# ---- Router setup -----------------------------------------------------------

router = APIRouter(prefix="", tags=["Applications"])



# =============================================================================
# Applications — CRUD & Queries
# =============================================================================


@router.get("/applications")
async def get_all_applications(status: Optional[str] = None) -> list[dict]:
    """
    List applications, optionally filtered by `status`.

    Query Params:
        status: Optional status filter (e.g., "APPLIED", "FUNDED").

    Returns:
        A list of serialized application documents.
    """
    return await application_service.get_applications(status=status)


@router.get("/applications/search")
async def get_application_by_name(
    first_name: str = Query(...), last_name: str = Query(...)
) -> dict:
    """
    Find a single application by applicant name (case-insensitive, prefix match).

    Raises:
        HTTPException 404 if no document matches.
    """
    return await application_service.get_application_by_name(first_name, last_name)


@router.post("/applications")
async def create_application(application: LoanApplicationBase) -> dict:
    """
    Create a new application.

    Body:
        application: A JSON object compatible with LoanApplicationBase schema.

    Returns:
        {"id": "<inserted_id>"}
    """
    return await application_service.create_application(application)


@router.put("/applications/{app_id}")
@router.patch("/applications/{app_id}")
async def update_application(app_id: str, application_update: LoanApplicationUpdate) -> dict:
    """
    Update an existing application.

    Path:
        app_id: Application ObjectId as string.

    Body:
        Partial fields to update.

    Raises:
        HTTPException 404 if document not found.
    """
    return await application_service.update_application(app_id, application_update)


# =============================================================================
# File Uploads — Single & Multi-Type
# =============================================================================

@router.post("/applications/{id}/upload")
async def upload_file(
    id: str, file: UploadFile = File(...), file_type: FileType = Query(...)
) -> dict:
    """
    Upload a single file for a given application.

    Notes:
        - DB dependency (`db`) comes before defaulted params to avoid syntax issues.
        - Uses enum `FileType` for validation & Swagger dropdown.
    """
    return await application_service.upload_application_file(id, file, file_type)


# app/routes/application_routes.py
@router.post("/applications/{id}/upload-multi-type")
async def upload_multi_type_files(
    id: str,
    contract: Optional[UploadFile] = File(None),
    proof_of_address: Optional[UploadFile] = File(None),
    additional_doc: Optional[UploadFile] = File(None),
    id_proof: Optional[UploadFile] = File(None),
    bank_statement: Optional[UploadFile] = File(None),
    pay_stub: Optional[UploadFile] = File(None),
    photo_id: Optional[UploadFile] = File(None),
) -> dict:
    """
    Upload multiple *typed* files in a single request.

    Body (multipart/form-data):
        Any subset of the file fields above.

    Returns:
        {"uploaded": {"contract": {...}, "proof_of_address": {...}, ...}}

    Implementation detail:
        We build a `files_map` and pass it to the service; the service
        validates MIME, builds S3 keys, and uploads.
    """
    raw_map = {
        FileType.contract: contract,
        FileType.proof_of_address: proof_of_address,
        FileType.additional_doc: additional_doc,
        FileType.id_proof: id_proof,
        FileType.bank_statement: bank_statement,
        FileType.pay_stub: pay_stub,
        FileType.photo_id: photo_id,
    }
    files_map = {k: v for k, v in raw_map.items() if v is not None and getattr(v, "filename", "")}

    if not files_map:
        raise HTTPException(status_code=400, detail="No files provided")
    return await application_service.upload_multiple_files(id, files_map)




# =============================================================================
# File Download & Listing
# =============================================================================

@router.get("/applications/{id}/download", response_class=StreamingResponse)
async def download_application_file(
    id: str,
    file_type: FileType = Query(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> StreamingResponse:
    """
    Stream a file from S3 back to the client.

    Returns:
        StreamingResponse with proper Content-Type and filename.
    """
    application = await db.applications.find_one({"_id": ObjectId(id)})
    first = application.get("main_applicant", {}).get("first_name", "unknown")
    last = application.get("main_applicant", {}).get("last_name", "unknown")
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    return download_file(id, last, first, file_type)


@router.get("/applications/{application_id}/files", response_model=list[str])
async def list_files(
    application_id: str, 
    db: AsyncIOMotorDatabase = Depends(get_db)) -> list[str]:
    """
    List logical file names for a given application.

    Returns:
        A list of user-facing file labels (e.g., ["contract.pdf", "proof_of_address.pdf"]).
    """
    try:
        # Get applicant names from DB
        application = await db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

        last_name = application.get("main_applicant", {}).get("last_name", "unknown").lower()
        first_name = application.get("main_applicant", {}).get("first_name", "unknown").lower()

        applicant_name = f"{last_name}_{first_name}"
        prefix = f"{applicant_name}_{application_id}/"

        response = s3_client.list_objects_v2(Bucket=S3_BUCKET, Prefix=prefix)

        if "Contents" not in response:
            return []

        filenames = [obj["Key"].split("/", 1)[-1] for obj in response["Contents"]]
        return filenames

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing S3 files: {str(e)}") from e




# =============================================================================
# Reporting
# =============================================================================

@router.get("/report")
async def get_filtered_applications(
    db: AsyncIOMotorDatabase = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
) -> dict:
    """
    Paginated report of applications filtered by status and/or date range.

    Query Params:
        page, page_size: Pagination controls.
        status: Optional status filter.
        start_date, end_date: ISO8601 strings (inclusive range) applied on `application_date`.

    Returns:
        {
          "data": [...],
          "total": <int>,
          "page": <int>,
          "page_size": <int>,
          "pages": <int>
        }
    """
    skip = (page - 1) * page_size
    limit = page_size

    query = {}
    if status:
        query["status"] = status
    if start_date and end_date:
        query["application_date"] = {
            "$gte": datetime.fromisoformat(start_date),
            "$lte": datetime.fromisoformat(end_date),
        }

    total = await db.applications.count_documents(query)
    results_cursor = db.applications.find(query).skip(skip).limit(limit)
    results = await results_cursor.to_list(length=limit)
    results = [serialize_document(doc) for doc in results]

    return {
        "data": results,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size,
    }


@router.get("/report/download")
async def download_report(
    db: AsyncIOMotorDatabase = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    status: Optional[str] = None,
    format: str = "pdf"
) -> StreamingResponse:
    """
    Generate & download a report (PDF/Excel).

    Query Params:
        format: "pdf" | "excel"
        status, start_date, end_date: Optional filters.

    Returns:
        StreamingResponse with the generated file.
    """
    if format not in ["pdf", "excel"]:
        raise HTTPException(status_code=400, detail="Invalid format. Use 'pdf' or 'excel'.")

    query = {}
    if status:
        query["status"] = status
    if start_date and end_date:
        query["application_date"] = {
            "$gte": datetime.fromisoformat(start_date),
            "$lte": datetime.fromisoformat(end_date),
        }

    data = await db.applications.find(query).to_list(length=None)
    for doc in data:
        doc["_id"] = str(doc["_id"])

    if format == "pdf":
        file_bytes = generate_pdf_report(data)
        filename = "report.pdf"
        media_type = "application/pdf"
    else:
        file_bytes = generate_excel_report(data)
        filename = "report.xlsx"
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
