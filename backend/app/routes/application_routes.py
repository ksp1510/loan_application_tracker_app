from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Depends
from typing import List, Optional
from app.services import application_service
from app.models.model import LoanApplicationBase, LoanApplicationUpdate
from app.utils.db.mongodb import get_db
from app.utils.file_handler import s3_client, S3_BUCKET
from datetime import datetime

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
async def upload_file(id: str, file: UploadFile = File(...), db=Depends(get_db)):
    try:
        return await application_service.upload_application_file(db, id, file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/applications/{id}/files/{filename}")
async def download_file(id: str, filename: str, db=Depends(get_db)):
    try:
        return await application_service.download_application_file(db, id, filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

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
