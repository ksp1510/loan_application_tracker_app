from datetime import datetime, timedelta
from config import db

async def calculate_payment_date(application_id: str):
    application = await db.applications.find_one({"_id": application_id})
    if not application:
        return {"error": "Application not found"}
    
    last_paycheck_date = datetime.strptime(application["last_paycheck_date"], "%Y-%m-%d")
    pay_frequency = application["pay_frequency"].lower()
    min_payment_date = datetime.utcnow() + timedelta(days=21)
    
    while last_paycheck_date < min_payment_date:
        if pay_frequency == "weekly":
            last_paycheck_date += timedelta(days=7)
        elif pay_frequency == "biweekly":
            last_paycheck_date += timedelta(days=14)
        elif pay_frequency == "monthly":
            last_paycheck_date += timedelta(days=30)
        elif pay_frequency == "semi-monthly":
            last_paycheck_date += timedelta(days=15)
        else:
            return {"error": "Invalid pay frequency"}
    
    first_payment_date = last_paycheck_date
    days_until_payment = (first_payment_date - datetime.utcnow()).days
    return {"first_payment_date": first_payment_date.strftime("%Y-%m-%d"), "days_until_payment": days_until_payment}
