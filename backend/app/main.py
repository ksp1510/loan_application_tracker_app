from fastapi import FastAPI
import logging
from app.routes.application_routes import router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)
logger.info(
    "S3 cfg -> bucket=%s region=%s key=%s…",
    os.getenv("S3_BUCKET"),
    os.getenv("AWS_REGION"),
    (os.getenv("AWS_ACCESS_KEY_ID") or "")[:4]  # mask
)

app = FastAPI()

app.include_router(router, prefix="", tags=["Applications"])
# Allow Angular dev server origin and any others as needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


