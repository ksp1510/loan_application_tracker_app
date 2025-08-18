# Loan Application Tracker App

A full-stack web application to manage and track loan applications from submission to funding.  
Built using **Angular 18** (frontend) and **FastAPI** (backend) with **MongoDB** as the database.  
Includes file storage on **AWS S3** and reporting features in **PDF/Excel**.

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
- MongoDB (via Motor/PyMongo)
- AWS S3 (boto3 for file handling)

### Deployment Target
- Frontend: Localhost (dev) → planned AWS EC2 / S3 hosting
- Backend: Localhost (dev) → planned AWS EC2 deployment
- Database: MongoDB Atlas or local MongoDB

---

## 📂 Project Structure

loan_application_tracker_app/
│
├── frontend/                     # Angular UI for application tracker
│   ├── src/app/components/       # Dashboard, Form, Reports, etc.
│   ├── src/app/services/         # Application & File Upload Services
│   └── ...
│
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── main.py               # API entrypoint
│   │   ├── routes/               # API endpoints
│   │   ├── services/             # Business logic (service layer)
│   │   ├── models/               # Pydantic models
│   │   ├── utils/                # DB client, file handling, reports
│   │   └── constants.py          # Enum-like constants
│   └── docs/                     # Dev docs (API, Styleguide, etc.)



---

## 🌟 Key Features

### ✅ Frontend
- Loan application form (main & co-applicant, income, expenses, vehicles, loans).
- File **upload & download** with S3 integration.
- Dynamic co-applicant toggling.
- Dashboard with summary cards and status color mapping.
- PDF & Excel report export (`jspdf`, `xlsx`).
- Responsive UI with Angular Material.
- Server-side pagination, filtering, and sorting in reports.

### ✅ Backend
- CRUD APIs for loan applications.
- File storage/retrieval in AWS S3.
- Dynamic **report generation** by date/status → **Excel** or **PDF**.
- Application data validation via Pydantic.
- Clean route ↔ service separation.
- CORS enabled.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+), Angular CLI
- Python 3.10+
- MongoDB (local or Atlas)
- AWS S3 credentials

---

### 🔧 Backend Setup

bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt


#### Environment Variables (`.env`)

Create a `.env` file inside `backend/`:

ini
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net
MONGODB_DB=Applicants

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=loan-application-files


#### Run API Server

bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000


* API: `http://localhost:8000`
* Swagger: `http://localhost:8000/docs`
* ReDoc: `http://localhost:8000/redoc`

---

### 💻 Frontend Setup

bash
cd frontend
npm install
ng serve --open


* App: `http://localhost:4200`

---

## 🧪 Sample API Endpoints

* `GET /applications` → List all applications
* `GET /applications/{id}` → Get application by ID
* `POST /applications` → Add new application
* `PUT /applications/{id}` → Update application
* `POST /applications/{id}/upload` → Upload file
* `GET /applications/{id}/files` → List files
* `GET /applications/report?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&status=FUNDED` → Generate filtered report

---

## 📦 Frontend Export Libraries

bash
npm install jspdf jspdf-autotable xlsx


* `jspdf` & `jspdf-autotable` → PDF generation
* `xlsx` → Excel export

---

## ✅ Future Enhancements

* ✅ Auto-calc of first payment date
* ✅ Notes section for funding team
* ✅ Priority rotation logic
* ⏳ Authentication & roles
* ⏳ Application status timeline UI
* ⏳ Admin reporting dashboard

---

## 🧪 Testing Environment (Dev)

* **Frontend (Laptop):** `ng serve`
* **Backend (Raspberry Pi / EC2):**
  Start FastAPI on `host=0.0.0.0`
  Access from laptop via `http://<server_ip>:8000`

---

## 📖 Developer Documentation

More details in `/backend/docs/`:

* `ARCHITECTURE.md` → System design overview
* `API.md` → Endpoints reference
* `STYLEGUIDE.md` → Linting, typing, formatting
* `CONTRIBUTING.md` → How to contribute
* `COMMENTS.md` → Docstring & inline comment guidelines

---

## 📄 License

This project is under [MIT License](LICENSE)

---

## 🙌 Contributions

Fork, PRs, and issues are welcome. Please read [CONTRIBUTING.md](backend/docs/CONTRIBUTING.md).

---

## ✍️ Author

**Kishan Patel**
[GitHub Profile](https://github.com/ksp1510)
