from bson import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException
from pymongo import ReturnDocument
from app.database import get_db
from app.security import current_user
from app.services.ai import generate_review
from app.services.audit import create_audit_log
from app.services.risk import calculate_risk
from app.utils import now, oid, serialize, split_list, success

router = APIRouter(prefix="/api/releases", tags=["releases"])

allowed_statuses = ["draft", "pending_review", "approved", "rolling_out", "paused", "rolled_back", "completed", "failed"]


def release_payload(body: dict, user_id: str) -> dict:
    payload = {
        "title": body.get("title"),
        "version": body.get("version"),
        "environment": body.get("environment"),
        "deploymentType": body.get("deploymentType"),
        "changedModules": split_list(body.get("changedModules")),
        "pullRequests": split_list(body.get("pullRequests")),
        "featureFlags": split_list(body.get("featureFlags")),
        "testPassPercentage": float(body.get("testPassPercentage") or 0),
        "filesChanged": int(body.get("filesChanged") or 0),
        "criticalFilesChanged": int(body.get("criticalFilesChanged") or 0),
        "knownIssues": body.get("knownIssues", ""),
        "rollbackPlan": body.get("rollbackPlan", ""),
        "ownerTeam": body.get("ownerTeam", ""),
        "businessImpact": body.get("businessImpact", ""),
        "status": "pending_review",
        "createdBy": ObjectId(user_id),
        "createdAt": now(),
        "updatedAt": now(),
    }
    payload.update(calculate_risk(payload))
    payload.pop("factors", None)
    return payload


@router.get("")
async def list_releases(user=Depends(current_user)):
    db = get_db()
    releases = await db.releases.find({}).sort("createdAt", -1).to_list(200)
    return success(releases)


@router.post("")
async def create_release(body: dict = Body(...), user=Depends(current_user)):
    db = get_db()
    release = release_payload(body, user["id"])
    result = await db.releases.insert_one(release)
    release["_id"] = result.inserted_id

    review = await generate_review(serialize(release))
    review_doc = {"releaseId": release["_id"], **review, "createdAt": now(), "updatedAt": now()}
    review_result = await db.ai_reviews.insert_one(review_doc)
    review_doc["_id"] = review_result.inserted_id

    await create_audit_log(db, user["id"], release["_id"], "created", f"Release created with {release['riskLevel']} risk ({release['riskScore']}/100).")
    return success({"release": release, "aiReview": review_doc})


@router.get("/{release_id}")
async def get_release(release_id: str, user=Depends(current_user)):
    db = get_db()
    release = await db.releases.find_one({"_id": oid(release_id)})
    if not release:
        raise HTTPException(status_code=404, detail="Release not found")

    creator = await db.users.find_one({"_id": release.get("createdBy")}, {"password": 0}) if release.get("createdBy") else None
    if creator:
        release["createdBy"] = creator

    review = await db.ai_reviews.find_one({"releaseId": oid(release_id)}, sort=[("createdAt", -1)])
    logs = await db.audit_logs.find({"releaseId": oid(release_id)}).sort("createdAt", -1).to_list(100)
    for log in logs:
        if log.get("userId"):
            log["userId"] = await db.users.find_one({"_id": log["userId"]}, {"name": 1, "email": 1})
    return success({"release": release, "aiReview": review, "auditLogs": logs})


@router.patch("/{release_id}/status")
async def update_status(release_id: str, body: dict = Body(...), user=Depends(current_user)):
    db = get_db()
    status = body.get("status")
    if status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid release status")
    result = await db.releases.find_one_and_update(
        {"_id": oid(release_id)},
        {"$set": {"status": status, "updatedAt": now()}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Release not found")

    messages = {
        "approved": "Release approved for rollout.",
        "rolling_out": "Rollout started.",
        "paused": "Rollout paused for health review.",
        "rolled_back": "Release rolled back.",
        "completed": "Rollout marked completed.",
        "failed": "Release marked failed.",
        "pending_review": "Release moved back to pending review.",
    }
    await create_audit_log(db, user["id"], release_id, status, messages.get(status, f"Release status changed to {status}."))
    return success(result)


@router.delete("/{release_id}")
async def delete_release(release_id: str, user=Depends(current_user)):
    db = get_db()
    release_oid = oid(release_id)
    result = await db.releases.delete_one({"_id": release_oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Release not found")
    await db.ai_reviews.delete_many({"releaseId": release_oid})
    await db.rollout_events.delete_many({"releaseId": release_oid})
    await db.incidents.delete_many({"releaseId": release_oid})
    await db.audit_logs.delete_many({"releaseId": release_oid})
    return success(message="Release deleted")
