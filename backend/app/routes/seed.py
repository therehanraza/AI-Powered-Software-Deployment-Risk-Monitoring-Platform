from fastapi import APIRouter
from app.database import get_db
from app.services.seed_data import seed_database
from app.utils import success

router = APIRouter(prefix="/api/seed", tags=["seed"])


@router.post("")
async def seed():
    result = await seed_database(get_db())
    return success(result, "Demo data seeded")
