from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Depends
from typing import List, Optional
from app.services import application_service
from app.models.model import LoanApplicationBase, LoanApplicationUpdate
from app.utils.db.mongodb import get_db

router = APIRouter()

@router.get("/applications")
def get_all_applications(status: Optional[str] = None):
    return application_service.get_applications(status=status)

@router.get("/applications/search")
def get_application_by_name(first_name: str = Query(...), last_name: str = Query(...)):
    return application_service.get_application_by_name(first_name, last_name)

@router.post("/applications")
def create_application(application: LoanApplicationBase):
    return application_service.create_application(application)

@router.put("/applications/{app_id}")
@router.patch("/applications/{app_id}")
def update_application(app_id: str, application_update: LoanApplicationUpdate):
    return application_service.update_application(app_id, application_update)

@router.post("/applications/{id}/upload")
async def upload_file(id: str, file: UploadFile = File(...), db=Depends(get_db)):
    try:
        return application_service.upload_application_file(db, id, file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/applications/{id}/files/{filename}")
async def download_file(id: str, filename: str, db=Depends(get_db)):
    try:
        return application_service.download_application_file(db, id, filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/reports")
def generate_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    status: Optional[str] = None,
    format: str = 'excel'  # 'excel' or 'pdf'
):
    return application_service.generate_report(start_date, end_date, status, format)