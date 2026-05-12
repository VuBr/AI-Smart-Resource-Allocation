from fastapi import APIRouter

from app.core.security import (  # TODO: Replace with real JWT auth before production
    create_access_token,
)
from app.schemas.auth import LoginRequest, LoginResponse

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest) -> LoginResponse:
    # TODO: Replace with real JWT auth before production
    # STUB: any credentials → static mock token
    token = create_access_token({"sub": request.email})
    return LoginResponse(access_token=token, token_type="bearer", role="admin")
