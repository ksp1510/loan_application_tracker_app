from fastapi import HTTPException, UploadFile
from typing import Optional
from datetime import datetime
from app.models.model import LoanApplicationBase, LoanApplicationUpdate
from app.utils.db.mongodb import db
from app.utils.file_handler import save_file, get_file_response
from app.utils.reports.generator import generate_excel_report, generate_pdf_report
from bson import ObjectId

import asyncio

async def get_applications(status: Optional[str] = None):
    query = {"status": status} if status else {}
    return await db.applications.find(query).to_list(length=None)

def get_application_by_name(first_name: str, last_name: str):
    query = {
        "main_applicant.first_name": {"$regex": f"^{first_name}", "$options": "i"},
        "main_applicant.last_name": {"$regex": f"^{last_name}", "$options": "i"}
    }
    result = db.applications.find_one(query)
    if not result:
        raise HTTPException(status_code=404, detail="Application not found")
    return result

async def create_application(application: LoanApplicationBase):
    application_dict = application.dict()
    application_dict["application_date"] = datetime.utcnow()
    result = await db.applications.insert_one(application_dict)
    return {"id": str(result.inserted_id)}

async def update_application(app_id: str, update_data: LoanApplicationUpdate):
    result = await db.applications.update_one({"_id": app_id}, {"$set": update_data.dict(exclude_unset=True)})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application updated"}

def upload_application_file(db, application_id: str, file):
    application = db["applications"].find_one({"_id": ObjectId(application_id)})
    if not application:
        raise ValueError("Application not found")
    applicant_last_name = application.get("main_applicant", {}).get("last_name")
    if not applicant_last_name:
        raise ValueError("Applicant last name is missing or invalid")
    return save_file(application_id, file, applicant_last_name)

def download_application_file(db, application_id: str, filename: str):
    application = db["applications"].find_one({"_id": ObjectId(application_id)})
    if not application:
        raise ValueError("Application not found")
    applicant_last_name = application.get("main_applicant", {}).get("last_name")
    if not applicant_last_name:
        raise ValueError("Applicant last name is missing or invalid")
    return get_file_response(application_id, filename, applicant_last_name)




async def generate_report(start_date, end_date, status, format):
    query = {}
    if status:
        query["status"] = status
    if start_date and end_date:
        query["application_date"] = {
            "$gte": datetime.fromisoformat(start_date),
            "$lte": datetime.fromisoformat(end_date)
        }
    data = await db.applications.find(query).to_list(length=None)
    if format == 'pdf':
        return generate_pdf_report(data)
    return generate_excel_report(data)