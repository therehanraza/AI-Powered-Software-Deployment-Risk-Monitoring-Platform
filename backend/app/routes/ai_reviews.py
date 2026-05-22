from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.security import current_user
from app.services.ai import generate_review
from app.services.audit import create_audit_log
from app.utils import now, oid, success

router = APIRouter(prefix="/api/ai-reviews", tags=["ai-reviews"])


@router.get("")
async def list_ai_reviews(user=Depends(current_user)):
    db = get_db()
    reviews = await db.ai_reviews.find({}).sort("createdAt", -1).to_list(200)
    for review in reviews:
        release = await db.releases.find_one({"_id": review.get("releaseId")}, {"title": 1, "version": 1, "riskScore": 1, "riskLevel": 1})
        if release:
            review["releaseId"] = release
    return success(reviews)


@router.post("/{release_id}/regenerate")
async def regenerate_review(release_id: str, user=Depends(current_user)):
    db = get_db()
    release = await db.releases.find_one({"_id": oid(release_id)})
    if not release:
        raise HTTPException(status_code=404, detail="Release not found")
    review = await generate_review(release)
    review_doc = {"releaseId": release["_id"], **review, "createdAt": now(), "updatedAt": now()}
    result = await db.ai_reviews.insert_one(review_doc)
    review_doc["_id"] = result.inserted_id
    await create_audit_log(db, user["id"], release_id, "ai_review_regenerated", f"AI review regenerated using {review_doc['provider']}.")
    return success(review_doc)
