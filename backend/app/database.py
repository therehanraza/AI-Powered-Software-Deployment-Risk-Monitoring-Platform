from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from fastapi import HTTPException
from app.config import settings

client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    global client, database
    if not settings.mongo_uri:
      print("MONGO_URI is missing. Add MongoDB Atlas M0 connection string before using persistent data.")
      return

    client = AsyncIOMotorClient(settings.mongo_uri)
    database = client[settings.mongo_db_name]
    await client.admin.command("ping")
    print("MongoDB connected")


async def close_mongo() -> None:
    global client
    if client:
        client.close()


def get_db() -> AsyncIOMotorDatabase:
    if database is None:
        raise HTTPException(status_code=503, detail="MongoDB is not connected. Add MONGO_URI and restart the backend.")
    return database
