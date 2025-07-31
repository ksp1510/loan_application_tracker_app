import pytest
from httpx import AsyncClient
from app.main import app
from backend.app.models.model import LoanApplication
from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_create_application():
    """Test creating a new loan application"""
    new_application = {
        "first_name": "John",
        "last_name": "Doe",
        "approved_amount": 5000.0,
        "security_type": "Car",
        "status": "Contract pending",
        "loan_officer_name": "Alice Johnson",
        "last_paycheck_date": "2024-02-01",
        "pay_frequency": "biweekly"
    }
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/applications/", json=new_application)

    assert response.status_code == 200
    assert "id" in response.json()

@pytest.mark.asyncio
async def test_get_applications():
    """Test retrieving applications by partial first name match"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/applications/", params={"first_name": "Jo"})
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert any(app["first_name"].startswith("Jo") for app in response.json())

@pytest.mark.asyncio
async def test_update_application_status():
    """Test updating loan application status"""
    application_id = "12345"  # Replace with an actual ID from the test database
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.put(f"/applications/{application_id}/status", params={"status": "Funded"})

    assert response.status_code in [200, 404]  # If app exists, status should be updated

@pytest.mark.asyncio
async def test_upload_file():
    """Test uploading a file to a loan application"""
    application_id = "12345"  # Replace with an actual ID from the test database
    file_content = b"Test contract file content"
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        files = {"file": ("contract.pdf", file_content, "application/pdf")}
        response = await client.post(f"/applications/{application_id}/upload", files=files)

    assert response.status_code == 200
    assert "file_path" in response.json()

@pytest.mark.asyncio
async def test_calculate_payment_date():
    """Test calculating the first payment date based on pay frequency"""
    application_id = "12345"  # Replace with an actual ID from the test database
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(f"/applications/{application_id}/calculate_payment_date")

    assert response.status_code in [200, 404]
    if response.status_code == 200:
        data = response.json()
        assert "first_payment_date" in data
        assert "days_until_payment" in data
