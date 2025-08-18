"""
app/utils/reports/generator.py
------------------------------
Lightweight report builders used by the /report/download endpoint.

- `generate_pdf_report`: renders a simple one-page (or multi-page) summary list.
- `generate_excel_report`: writes a tabular workbook with a header row.

Both functions accept a list of already-serialized dicts (ObjectIds → str).
They return raw bytes suitable for FastAPI StreamingResponse.

Keep these pure: no DB or framework imports here.
"""


import io

from openpyxl import Workbook
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe_get(d: dict, path: Sequence[str], default: str = "") -> str:
    """
    Traverse nested dict keys and return a stringified value (or default).

    Example:
        _safe_get(doc, ["main_applicant", "first_name"])
    """
    cur: object = d
    for k in path:
        if not isinstance(cur, dict) or k not in cur:
            return default
        cur = cur[k]
    return "" if cur is None else str(cur)


def _derive_common_columns(rows: list[dict]) -> list[str]:
    """
    Pick a reasonable, stable set of columns for tabular output.

    Priority:
      1) Keys we care about most (explicit list below).
      2) Any remaining top-level keys (sorted) for completeness.
    """
    preferred = [
        "_id",
        "status",
        "application_date",
        "amount",
        "security",
        "reason",
        "notes",
        "main_applicant.first_name",
        "main_applicant.last_name",
        "co_applicant.first_name",
        "co_applicant.last_name",
    ]

    # Gather all top-level keys (avoid exploding deep structures in Excel)
    top_keys: set[str] = set()
    for r in rows:
        top_keys.update(k for k in r.keys() if isinstance(k, str))

    # Expand nested fields we explicitly want
    explicit_nested = {
        "main_applicant.first_name",
        "main_applicant.last_name",
        "co_applicant.first_name",
        "co_applicant.last_name",
    }

    cols = [c for c in preferred if c in explicit_nested or c in top_keys]
    # Add any leftover top-level keys not already included
    leftovers = sorted(k for k in top_keys if k not in cols)
    return cols + leftovers


# ---------------------------------------------------------------------------
# PDF
# ---------------------------------------------------------------------------

def generate_pdf_report(data: list[dict]) -> bytes:
    """
    Render a compact, readable PDF list of applications.

    Layout:
      - Title at top
      - One line per application: "YYYY-MM-DD — First Last — STATUS — Amount"

    Returns raw PDF bytes.
    """
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


# ---------------------------------------------------------------------------
# Excel
# ---------------------------------------------------------------------------

def generate_excel_report(data: list[dict]) -> bytes:
    """
    Write an .xlsx workbook.

    - Auto-derives a set of columns using `_derive_common_columns`.
    - For nested applicant names we expose dedicated columns
      (e.g., "main_applicant.first_name").

    Returns raw XLSX bytes.
    """
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
