import io

from openpyxl import Workbook
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def generate_pdf_report(data: list[dict]) -> bytes:
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    y = height - 50
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Loan Applications Report")
    p.setFont("Helvetica", 10)

    y -= 30
    for idx, doc in enumerate(data, 1):
        line = f"{idx}. {doc.get('main_applicant', {})
            .get('first_name', '')} {doc.get('main_applicant', {})
            .get('last_name', '')} - {doc.get('status', '')}"
        p.drawString(50, y, line)
        y -= 15
        if y < 50:  # start new page
            p.showPage()
            y = height - 50

    p.save()
    buffer.seek(0)
    return buffer.getvalue()  # ✅ return bytes


def generate_excel_report(data: list[dict]) -> bytes:
    buffer = io.BytesIO()
    wb = Workbook()
    ws = wb.active
    ws.title = "Loan Applications"

    headers = ["First Name", "Last Name", "Status"]
    ws.append(headers)

    for doc in data:
        ws.append(
            [
                doc.get("main_applicant", {}).get("first_name", ""),
                doc.get("main_applicant", {}).get("last_name", ""),
                doc.get("status", ""),
            ]
        )

    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()  # ✅ return bytes
