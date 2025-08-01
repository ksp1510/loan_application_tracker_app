# Loan Application Tracker App

A full-stack web application to manage and track loan applications from submission to funding, built using **Angular** (frontend) and **FastAPI** (backend) with **MongoDB** as the database.

---

## 🔧 Tech Stack

### Frontend
- [Angular 18](https://angular.io/)
- Angular Material
- TypeScript
- Bootstrap

### Backend
- [FastAPI](https://fastapi.tiangolo.com/)
- Pydantic
- Uvicorn
- MongoDB (via PyMongo)

### Deployment Target
- Frontend: Localhost (dev) → planned AWS EC2 / S3 hosting
- Backend: Localhost (dev) → planned AWS EC2 deployment

---

## 📂 Project Structure

```
loan_application_tracker_app/
│
├── frontend/                     # Angular UI for application tracker
│   ├── src/app/components/      # Dashboard, Form, Reports, etc.
│   ├── src/app/services/        # Application & File Upload Services
│   └── ...
│
├── backend/                     # FastAPI backend
│   ├── main.py                  # API entrypoint
│   ├── models/                  # Pydantic models
│   ├── routes/                  # API endpoints
│   ├── utils/                   # File handling, filtering
│   └── ...
```

---

## 🌟 Key Features

### ✅ Frontend
- Application form with full details (main & co-applicant, income, expenses, vehicle, loans)
- File upload & download
- Dynamic co-applicant toggling
- PDF & Excel report export (via `jspdf` and `xlsx`)
- Dashboard with summary cards and status color mapping
- Responsive design with Angular Material
- Server-side pagination, filtering, sorting in Reports

### ✅ Backend
- CRUD APIs for applications
- File storage and retrieval
- Dynamic report generation (by date range & status)
- Application data validation
- CORS and clean API routing

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+), Angular CLI
- Python 3.10+
- MongoDB (local or remote)

---

### 🔧 Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> Default API: `http://localhost:8000`

---

### 💻 Frontend Setup

```bash
cd frontend
npm install
ng serve --open
```

> App runs on: `http://localhost:4200`

---

## 🧪 Sample API Endpoints

- `GET /applications` → List all
- `GET /applications/{id}` → Get application by ID
- `POST /applications` → Add application
- `PUT /applications/{id}` → Update application
- `DELETE /applications/{id}` → Delete application
- `POST /applications/{id}/upload` → Upload file
- `GET /applications/{id}/files` → List files
- `GET /applications/report?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&status=FUNDED` → Filtered report

---

## 📦 Export Libraries Used

- `jspdf` & `jspdf-autotable` → PDF generation
- `xlsx` → Excel file export

```bash
npm install jspdf jspdf-autotable xlsx
```

---

## ✅ Future Enhancements

- ✅ Authentication & Role Management
- ✅ Auto-calculation of first payment date
- ✅ In-app Toast Notifications
- ✅ Multi-page PDF summary
- ⏳ Application status timeline UI
- ⏳ Admin view for reports

---

## 🧪 Testing Environment (Dev)

You can run:
- **Frontend on Laptop**: `ng serve`
- **Backend on Raspberry Pi**: Connect Pi to same Wi-Fi and start FastAPI server on `host=0.0.0.0`
- Access backend on laptop via: `http://<raspberry_pi_ip>:8000`

---

## 📄 License

This project is under [MIT License](LICENSE)

---

## 🙌 Contributions

Feel free to fork, submit PRs, or raise issues for improvements.

---

## ✍️ Author

**Kishan Patel**  
[GitHub Profile](https://github.com/ksp1510)
