import io
import pandas as pd
from fastapi.responses import StreamingResponse
from reportlab.pdfgen import canvas

def generate_excel_report(data: list):
    df = pd.DataFrame(data)
    stream = io.BytesIO()
    df.to_excel(stream, index=False)
    stream.seek(0)
    return StreamingResponse(stream, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=report.xlsx"})

def generate_pdf_report(data: list):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer)
    text_object = c.beginText(40, 800)
    text_object.setFont("Helvetica", 10)
    for item in data:
        text_object.textLine(str(item))
    c.drawText(text_object)
    c.showPage()
    c.save()
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=report.pdf"})
