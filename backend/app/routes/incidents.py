from fastapi import APIRouter, Body, Depends, HTTPException
from pymongo import ReturnDocument
from app.database import get_db
from app.security import current_user
from app.utils import now, oid, success

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


@router.get("")
async def list_incidents(user=Depends(current_user)):
    db = get_db()
    incidents = await db.incidents.find({}).sort("createdAt", -1).to_list(200)
    for incident in incidents:
        if incident.get("releaseId"):
            release = await db.releases.find_one({"_id": incident["releaseId"]}, {"title": 1, "version": 1, "riskLevel": 1})
            if release:
                incident["releaseId"] = release
    return success(incidents)


@router.post("")
async def create_incident(body: dict = Body(default={}), user=Depends(current_user)):
    db = get_db()
    releases = await db.releases.find({}).sort("createdAt", -1).to_list(1)
    release_id = oid(body["releaseId"]) if body.get("releaseId") else (releases[0]["_id"] if releases else None)
    payload = body if body.get("title") else {
        "title": "Elevated checkout latency during staged rollout",
        "severity": "high",
        "releaseId": release_id,
        "affectedModule": "checkout",
        "status": "investigating",
        "rootCause": "Payment validation retry loop increased downstream API calls.",
        "aiSummary": "The incident appears linked to checkout retry behavior. Keep rollout paused, disable the feature flag, and verify payment success rate before resuming.",
    }
    if isinstance(payload.get("releaseId"), str):
        payload["releaseId"] = oid(payload["releaseId"])
    payload["createdAt"] = now()
    payload["updatedAt"] = now()
    result = await db.incidents.insert_one(payload)
    payload["_id"] = result.inserted_id
    return success(payload)


@router.get("/{incident_id}")
async def get_incident(incident_id: str, user=Depends(current_user)):
    db = get_db()
    incident = await db.incidents.find_one({"_id": oid(incident_id)})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    if incident.get("releaseId"):
        release = await db.releases.find_one({"_id": incident["releaseId"]}, {"title": 1, "version": 1, "riskLevel": 1})
        if release:
            incident["releaseId"] = release
    return success(incident)


@router.patch("/{incident_id}")
async def update_incident(incident_id: str, body: dict = Body(...), user=Depends(current_user)):
    db = get_db()
    body["updatedAt"] = now()
    incident = await db.incidents.find_one_and_update({"_id": oid(incident_id)}, {"$set": body}, return_document=ReturnDocument.AFTER)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return success(incident)
