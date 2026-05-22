import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.database import close_mongo, connect_to_mongo, get_db
from app.services.seed_data import seed_database


async def main():
    await connect_to_mongo()
    result = await seed_database(get_db())
    print(f"Demo data seeded: {result}")
    await close_mongo()


if __name__ == "__main__":
    asyncio.run(main())
