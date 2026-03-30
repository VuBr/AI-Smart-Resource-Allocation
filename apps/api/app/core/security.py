# TODO: Replace with real JWT auth before production
# This is a STUB implementation for Phase 5 scaffold only.
# DO NOT deploy to production without replacing this with real JWT verification.

from typing import Any  # noqa: I001


MOCK_TOKEN = "mock.jwt.token.phase5"  # noqa: S105 — stub only


def create_access_token(data: dict[str, Any]) -> str:
    # TODO: Replace with real JWT auth before production
    return MOCK_TOKEN


def decode_token(token: str) -> dict[str, Any]:
    # TODO: Replace with real JWT auth before production
    # Stub: accept any non-empty token
    if not token:
        raise ValueError("Empty token")
    return {"sub": "mock-user-id", "role": "admin"}


def get_current_user_payload(token: str) -> dict[str, Any]:
    # TODO: Replace with real JWT auth before production
    return decode_token(token)
