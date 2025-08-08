from fastapi import HTTPException, UploadFile
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.models.model import LoanApplicationBase, LoanApplicationUpdate
from app.utils.db.mongodb import db
from app.utils.file_handler import save_file, get_file_response
from app.utils.reports.generator import generate_excel_report, generate_pdf_report
from app.utils.helpers import serialize_document
from app.constants import FileType
from typing import List
from app.utils.file_handler import validate_file_type,s3_folder_prefix
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from openpyxl import Workbook


async def get_applications(status: Optional[str] = None):
    query = {"status": status} if status else {}
    results = await db.applications.find(query).to_list(length=None)
    return [serialize_document(doc) for doc in results]


async def get_application_by_name(first_name: str, last_name: str):
    query = {
        "main_applicant.first_name": {"$regex": f"^{first_name}", "$options": "i"},
        "main_applicant.last_name": {"$regex": f"^{last_name}", "$options": "i"}
    }
    result = await db.applications.find_one(query)
    if not result:
        raise HTTPException(status_code=404, detail="Application not found")
    return serialize_document(result)

async def create_application(application: LoanApplicationBase):
    application_dict = application.dict()
    application_dict["application_date"] = datetime.utcnow()
    result = await db.applications.insert_one(application_dict)
    return {"id": str(result.inserted_id)}

async def update_application(app_id: str, update_data: LoanApplicationUpdate):
    result = await db.applications.update_one({"_id": ObjectId(app_id)}, {"$set": update_data.dict(exclude_unset=True)})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application updated"}

async def upload_application_file(app_id: str, file: UploadFile, file_type: FileType):
    application = await db.applications.find_one({"_id": ObjectId(app_id)})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    applicant_last_name = application.get("main_applicant", {}).get("last_name", "unknown")
    applicant_first_name = application.get("main_applicant", {}).get("first_name", "unknown")

    return save_file(app_id, file, applicant_last_name, applicant_first_name, file_type)


async def upload_multiple_files(
    id: str, files_map :dict):
    application = await db.applications.find_one({"_id": ObjectId(id)})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    applicant_last_name = application.get("main_applicant", {}).get("last_name")
    applicant_first_name = application.get("main_applicant", {}).get("first_name")

    responses = []

    for file_type, file in files_map.items():
        if file is None:
            continue
        validate_file_type(file)
        response = save_file(
            app_id=id,
            file=file,
            applicant_last_name=applicant_last_name,
            applicant_first_name=applicant_first_name,
            file_type=file_type
        )
        responses.append(response)

    return {"uploaded": responses}




async def download_application_file(db, application_id: str, filename: str):
    application = db["applications"].find_one({"_id": ObjectId(application_id)})
    if not application:
        raise ValueError("Application not found")
    applicant_last_name = application.get("main_applicant", {}).get("last_name")
    if not applicant_last_name:
        raise ValueError("Applicant last name is missing or invalid")
    return get_file_response(application_id, filename, applicant_last_name)


async def list_application_files(db, application_id: str, file_type: Optional[str] = None) -> List[str]:
    # 1) get applicant names to build the correct S3 folder
    app_doc = await db.applications.find_one({"_id": ObjectId(application_id)})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found")

    first_name = app_doc.get("main_applicant", {}).get("first_name", "unknown")
    last_name  = app_doc.get("main_applicant", {}).get("last_name", "unknown")

    prefix = s3_folder_prefix(application_id, last_name, first_name)

    # 2) list with pagination
    keys: List[str] = []
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
                filename = key[len(prefix):]  # strip folder path -> "contract.pdf"
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
        raise HTTPException(status_code=500, detail=f"Error listing S3 files: {str(e)}")

    return keys


def generate_pdf_report(data):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    y = height - 50
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Loan Applications Report")
    p.setFont("Helvetica", 10)

    y -= 30
    for idx, doc in enumerate(data, 1):
        line = f"{idx}. {doc.get('main_applicant', {}).get('first_name', '')} {doc.get('main_applicant', {}).get('last_name', '')} - {doc.get('status', '')}"
        p.drawString(50, y, line)
        y -= 15
        if y < 50:  # start new page
            p.showPage()
            y = height - 50

    p.save()
    buffer.seek(0)
    return buffer.getvalue()  # ✅ return bytes


def generate_excel_report(data):
    buffer = io.BytesIO()
    wb = Workbook()
    ws = wb.active
    ws.title = "Loan Applications"

    headers = ["First Name", "Last Name", "Status"]
    ws.append(headers)

    for doc in data:
        ws.append([
            doc.get('main_applicant', {}).get('first_name', ''),
            doc.get('main_applicant', {}).get('last_name', ''),
            doc.get('status', '')
        ])

    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()  # ✅ return bytes
    

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
    data = [serialize_document(doc) for doc in data]
    if format == 'pdf':
        return generate_pdf_report(data)
    return generate_excel_report(data)



