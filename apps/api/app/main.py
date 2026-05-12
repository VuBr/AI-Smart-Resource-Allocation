import time

from fastapi import FastAPI, Request, Response
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.routers import (
    allocations,
    auth,
    bench,
    dashboard,
    engineers,
    projects,
    reports,
)
from app.core.config import get_settings
from app.core.logging import log_event, setup_logging

setup_logging()

app = FastAPI(
    title="AI Smart Resource Allocation API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=f"{API_PREFIX}/auth", tags=["auth"])
app.include_router(engineers.router, prefix=f"{API_PREFIX}/engineers", tags=["engineers"])
app.include_router(projects.router, prefix=f"{API_PREFIX}/projects", tags=["projects"])
app.include_router(allocations.router, prefix=f"{API_PREFIX}/allocations", tags=["allocations"])
app.include_router(bench.router, prefix=f"{API_PREFIX}/bench", tags=["bench"])
app.include_router(reports.router, prefix=f"{API_PREFIX}/reports", tags=["reports"])
app.include_router(dashboard.router, prefix=f"{API_PREFIX}/dashboard", tags=["dashboard"])


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Return detail dict directly so error format is {"error": {"code": ..., "message": ...}}."""
    if isinstance(exc.detail, dict):
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": "HTTPError", "message": str(exc.detail)}},
    )


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next: object) -> Response:
    start = time.time()
    log_event("request_start", method=request.method, path=request.url.path)
    response: Response = await call_next(request)  # type: ignore[arg-type]
    latency_ms = round((time.time() - start) * 1000)
    log_event(
        "request_end",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        latency_ms=latency_ms,
    )
    return response


@app.on_event("startup")
async def startup_event() -> None:
    settings = get_settings()
    log_event("app_started", version="1.0.0", llm_provider=settings.LLM_PROVIDER)
    from app.core.redis import verify_redis_connection

    await verify_redis_connection()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    log_event("app_stopped")


@app.get(f"{API_PREFIX}/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok", "version": "1.0.0"}
