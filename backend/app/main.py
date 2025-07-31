from fastapi import FastAPI
from app.routes.application_routes import router

app = FastAPI()

# Include API routes
app.include_router(router)

@app.get("/")
def home():
    return {"message": "Loan Tracker APIs is running!"}
