from bson import ObjectId
from app.utils import now


async def create_audit_log(db, user_id, release_id, action: str, message: str):
    return await db.audit_logs.insert_one({
        "userId": ObjectId(user_id) if isinstance(user_id, str) else user_id,
        "releaseId": ObjectId(release_id) if isinstance(release_id, str) else release_id,
        "action": action,
        "message": message,
        "createdAt": now(),
        "updatedAt": now(),
    })
