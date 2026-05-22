from datetime import datetime
from bson import ObjectId


def now() -> datetime:
    return datetime.utcnow()


def serialize(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, list):
        return [serialize(item) for item in value]
    if isinstance(value, dict):
        return {key: serialize(val) for key, val in value.items()}
    return value


def success(data=None, message: str | None = None):
    response = {"success": True}
    if data is not None:
        response["data"] = serialize(data)
    if message:
        response["message"] = message
    return response


def split_list(value) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [item.strip() for item in str(value or "").split(",") if item.strip()]


def oid(value: str) -> ObjectId:
    return ObjectId(value)
