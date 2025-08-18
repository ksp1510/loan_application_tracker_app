# API Endpoint Reference

## Applications

- `POST /applications`: Create a new loan application
- `GET /applications`: List applications with optional filters
- `GET /applications/{id}`: Get application by ID
- `PUT /applications/{id}`: Update application by ID
- `DELETE /applications/{id}`: Delete application (not yet implemented)

## File Uploads

- `POST /applications/{id}/upload`: Upload a single document
- `POST /applications/{id}/upload-multi-type`: Upload multiple docs (photo_id, id_proof, etc.)
- `GET /applications/{id}/files`: List uploaded files
- `GET /applications/{id}/files/{filename}`: Download file

## Reports

- `GET /report`: Paginated report of applications
- `GET /report/download?format=pdf|excel`: Download full report in specified format
