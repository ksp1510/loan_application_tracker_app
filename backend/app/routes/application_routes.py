from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Depends
from typing import List, Optional
from app.services import application_service
from app.models.model import LoanApplicationBase, LoanApplicationUpdate
from app.utils.db.mongodb import get_db
from app.utils.file_handler import s3_client, S3_BUCKET, get_file_response
from datetime import datetime
from app.constants import FileType
from typing import List
from app.utils.db.mongodb import db
from bson import ObjectId
from fastapi.responses import StreamingResponse

router = APIRouter()

@router.get("/applications")
async def get_all_applications(status: Optional[str] = None):
    return await application_service.get_applications(status=status)

@router.get("/applications/search")
async def get_application_by_name(first_name: str = Query(...), last_name: str = Query(...)):
    return await application_service.get_application_by_name(first_name, last_name)

@router.post("/applications")
async def create_application(application: LoanApplicationBase):
    return await application_service.create_application(application)

@router.put("/applications/{app_id}")
@router.patch("/applications/{app_id}")
async def update_application(app_id: str, application_update: LoanApplicationUpdate):
    return await application_service.update_application(app_id, application_update)

@router.post("/applications/{id}/upload")
async def upload_file(
    id: str,
    file: UploadFile = File(...),
    file_type: FileType = Query(...)
):
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
):
    files_map = {
        FileType.contract: contract,
        FileType.proof_of_address: proof_of_address,
        FileType.additional_doc: additional_doc,
        FileType.id_proof: id_proof,
        FileType.bank_statement: bank_statement,
        FileType.pay_stub: pay_stub,
        FileType.photo_id: photo_id,
    }
    return await application_service.upload_multiple_files(id, files_map)


@router.get("/applications/{id}/download", response_class=StreamingResponse)
async def download_file(
    id: str,
    file_type: FileType,
    db = Depends(get_db),
):
    application = await db.applications.find_one({"_id": ObjectId(id)})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    first_name = application.get("main_applicant", {}).get("first_name", "unknown")
    last_name = application.get("main_applicant", {}).get("last_name", "unknown")

    return get_file_response(id, file_type, last_name, first_name)


    

@router.get("/applications/{application_id}/files", response_model=List[str])
async def list_files(application_id: str):
    try:
        prefix = f"{application_id}/"
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET, Prefix=prefix)
        if "Contents" not in response:
            return []
        filenames = [obj["Key"].split("/", 1)[-1] for obj in response["Contents"] if "/" in obj["Key"]]
        return filenames
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")


@router.get("/report")
async def get_filtered_applications(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db=Depends(get_db)
):
    skip = (page - 1) * page_size
    limit = page_size

    query = {}
    if status:
        query["status"] = status
    if start_date and end_date:
        query["application_date"] = {
            "$gte": datetime.fromisoformat(start_date),
            "$lte": datetime.fromisoformat(end_date)
        }

    total = await db.applications.count_documents(query)
    results_cursor = await db.applications.find(query).skip(skip).limit(limit)
    results = await results_cursor.to_list(length=limit)

    return {
        "data": results,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size
    }
