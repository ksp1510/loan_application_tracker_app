# Architecture Overview

This project is a **Loan Application Tracker** built using FastAPI and MongoDB. It allows users to create, update, view, and manage loan applications with features like document uploads, reports, and role-based view support.

## Components

- **FastAPI**: RESTful API server
- **MongoDB**: NoSQL database (AsyncIOMotor)
- **S3-compatible Storage**: For handling uploads/downloads
- **Pydantic Models**: For request/response validation
- **Routing**: Located in `routes/`, defines API endpoints
- **Services**: Located in `services/`, handles business logic
- **Utils**: Common utilities like file handling, S3 key generation, serialization

## File Structure

```
app/
├── constants.py
├── models/             # Pydantic schemas
├── routes/             # API routes
├── services/           # Business logic
├── utils/              # Helpers (file ops, reports, etc.)
├── main.py             # FastAPI app entry
```

## Flow

```
Client -> FastAPI Route -> Service Layer -> DB / S3 -> Response
```