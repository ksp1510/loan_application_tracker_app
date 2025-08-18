import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# Address
class Address(BaseModel):
    """Represents a Canadian address."""
    street: str
    city: str
    province: str
    postal_code: str

    @field_validator("postal_code")
    @classmethod
    def validate_postal_code(cls, v: str) -> str:
        """Validates Canadian postal code format."""
        if not re.match(r"^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$", v):
            raise ValueError("Invalid Canadian postal code format.")
        return v


# Employment
class Employment(BaseModel):
    """Represents employment details for a salaried applicant."""
    company_name: str
    position: str
    length_of_service: int
    gross_income: float
    company_address: Address
    company_phone: str


# SelfEmployed (if used later)
class SelfEmployed(BaseModel):
    """Details for applicants who are self-employed."""
    type_of_business: str
    operational_duration: int
    company_address: Address
    company_phone: str


# Vehicle
class Vehicle(BaseModel):
    """Represents a vehicle owned by the applicant."""
    year: int
    make: str
    model: str


# Financial Info
class FinancialInfo(BaseModel):
    """Breakdown of applicant’s monthly financial obligations."""
    utilities: int
    property_taxs: int
    child_support: int
    groceries: int
    car_insurence: int
    car_payment: int
    phone_bill: int
    internet: int


# Income
class Income(BaseModel):
    """Details of all income sources."""
    ft_income: int
    pt_income: Optional[int] = 0
    child_tax: Optional[int] = 0
    govt_support: Optional[int] = 0
    pension: Optional[int] = 0


# Loan Details
class Loan(BaseModel):
    """Existing loan information."""
    financial_institution: Optional[str] = None
    monthly_pymnt: Optional[int] = None


# Applicant
class Applicant(BaseModel):
    """Primary applicant’s personal and contact details."""
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    date_of_birth: str
    SIN: str
    address: Address
    duration_at_address: int
    rent: int
    cell_phone: str
    email: EmailStr
    marital_status: str
    dependents: int
    status_in_canada: str
    ft_employment: Optional[Employment] = None
    vehicle1: Optional[Vehicle] = None
    vehicle2: Optional[Vehicle] = None
    monthly_expenses: Optional[FinancialInfo] = None
    monthly_income: Optional[Income] = None
    loan: Optional[list[Loan]] = []

    @field_validator("cell_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Validates phone number format."""
        cleaned = re.sub(r"[\s().-]", "", v)
        if not re.match(r"^\d{10}$", cleaned):
            raise ValueError("Invalid phone number format. Example: 416-555-1234")
        return v


# Loan Application Base
class LoanApplicationBase(BaseModel):
    """Base model for loan applications."""
    main_applicant: Applicant
    co_applicant: Optional[Applicant] = None
    amount: Optional[float] = None
    security: Optional[str] = None
    status: str = "APPLIED"
    notes: Optional[str] = None
    application_date: datetime = Field(default_factory=datetime.utcnow)
    reason: Optional[str] = None


# DB Document Representation
class LoanApplication(LoanApplicationBase):
    id: str


# Fields allowed to update
class LoanApplicationUpdate(BaseModel):
    """Fields allowed to update in a loan application."""
    status: Optional[str] = None
    notes: Optional[str] = None
    reason: Optional[str] = None
    co_applicant: Optional[Applicant] = None
    amount: Optional[float] = None
    security: Optional[str] = None
