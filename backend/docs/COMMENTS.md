# Code Comment Templates

## Pydantic Models

```python
class LoanApplication(BaseModel):
    """Schema for loan application data."""
```

## Route Handler

```python
@router.get("/applications")
async def get_all_applications():
    """Returns a list of all loan applications."""
```

## Service Function

```python
async def create_application(app_data: dict) -> str:
    """Inserts a new application and returns its ID."""
```

## Utility

```python
def build_s3_key(applicant_name: str, doc_type: str) -> str:
    """Constructs the S3 key path for a given document."""
```