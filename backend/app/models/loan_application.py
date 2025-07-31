from pydantic import BaseModel

class LoanApplication(BaseModel):
    first_name: str
    last_name: str
    approved_amount: float
    #loan_fee: float
    #total_loan_amount: float
    security_type: str  # Car, Co-signer, or No Security
    status: str  # Contract pending, Funded, Declined, etc.
    loan_officer_name: str
    last_paycheck_date: str
    pay_frequency: str  # Weekly, Biweekly, Monthly, Semi-Monthly
