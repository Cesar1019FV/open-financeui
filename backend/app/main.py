"""FastAPI application entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as api_v1_router
from app.core.config import settings
from app.core.exceptions import add_exception_handlers

app = FastAPI(
    title=settings.app_name,
    description="FastAPI backend for the open-finance personal finance app",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router)
add_exception_handlers(app)


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}
