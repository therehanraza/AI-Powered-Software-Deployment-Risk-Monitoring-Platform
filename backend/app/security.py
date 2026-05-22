from datetime import datetime, timedelta
from fastapi import Depends, Header, HTTPException
from bson import ObjectId
import bcrypt
import jwt
from app.config import settings
from app.database import get_db
from app.utils import serialize


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user: dict) -> str:
    payload = {
        "id": str(user["_id"]),
        "role": user.get("role", "developer"),
        "email": user.get("email"),
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


async def current_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization.replace("Bearer ", "", 1)
    try:
        decoded = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(decoded["id"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user.pop("password", None)
    return public_user(user)


def public_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role"),
        "createdAt": user.get("createdAt"),
    }
