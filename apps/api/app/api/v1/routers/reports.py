from fastapi import APIRouter

router = APIRouter()


@router.get("/shortage")
async def get_shortage_report() -> list[dict]:
    # STUB: Mock skill shortage data
    return [
        {"skill": "Backend (Python)", "required": 3, "available": 1, "gap": 2},
        {"skill": "Frontend (React)", "required": 2, "available": 2, "gap": 0},
        {"skill": "Data Engineering", "required": 1, "available": 0, "gap": 1},
    ]
