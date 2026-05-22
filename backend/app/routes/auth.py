from fastapi import APIRouter, Body, Depends, HTTPException
from app.database import get_db
from app.security import create_token, current_user, hash_password, public_user, verify_password
from app.utils import now, success

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup")
async def signup(payload: dict = Body(...)):
    db = get_db()
    email = str(payload.get("email", "")).lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    user = {
        "name": payload.get("name"),
        "email": email,
        "password": hash_password(payload.get("password", "")),
        "role": payload.get("role", "developer"),
        "createdAt": now(),
        "updatedAt": now(),
    }
    result = await db.users.insert_one(user)
    user["_id"] = result.inserted_id
    token = create_token(user)
    return success({"user": public_user(user), "token": token})


@router.post("/login")
async def login(payload: dict = Body(...)):
    db = get_db()
    email = str(payload.get("email", "")).lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.get("password", ""), user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return success({"user": public_user(user), "token": create_token(user)})


@router.get("/me")
async def me(user=Depends(current_user)):
    return success({"user": user})
