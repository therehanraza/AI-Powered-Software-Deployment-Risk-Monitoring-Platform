import random
from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.security import current_user
from app.services.audit import create_audit_log
from app.utils import now, oid, success

router = APIRouter(prefix="/api/rollout", tags=["rollout"])

stages = [10, 25, 50, 75, 100]


def recommendation(health: str, stage: int, risk_level: str) -> str:
    if health == "critical":
        return "Rollback is recommended before expanding traffic."
    if health == "degraded":
        return "Pause at this stage, inspect logs, and keep rollback ready."
    if health == "watch":
        return f"Continue carefully to the next stage only if {risk_level} release metrics stabilize for 10 minutes."
    return "Rollout can be marked completed after final verification." if stage == 100 else "Metrics look healthy. Continue staged rollout."


@router.get("/{release_id}")
async def get_rollout(release_id: str, user=Depends(current_user)):
    db = get_db()
    events = await db.rollout_events.find({"releaseId": oid(release_id)}).sort("stagePercentage", 1).to_list(20)
    return success(events)


@router.post("/{release_id}/simulate")
async def simulate_rollout(release_id: str, user=Depends(current_user)):
    db = get_db()
    release = await db.releases.find_one({"_id": oid(release_id)})
    if not release:
        raise HTTPException(status_code=404, detail="Release not found")
    existing = await db.rollout_events.find({"releaseId": release["_id"]}).sort("stagePercentage", 1).to_list(10)
    if len(existing) >= len(stages):
        raise HTTPException(status_code=400, detail="Rollout already reached 100%")

    stage = stages[len(existing)]
    risk = release.get("riskScore", 50) / 100
    pressure = stage / 100
    error_rate = round(max(0.05, risk * 3.2 + pressure * 1.5 + random.random() * 0.8), 2)
    latency = round(110 + risk * 420 + pressure * 110 + random.random() * 80)
    complaints = round(risk * pressure * 18 + random.random() * 3)
    health = "critical" if error_rate > 3.8 or latency > 560 or complaints > 8 else "degraded" if error_rate > 2.4 or latency > 420 or complaints > 5 else "watch" if error_rate > 1.4 or latency > 280 or complaints > 2 else "healthy"

    event = {
        "releaseId": release["_id"],
        "stagePercentage": stage,
        "errorRate": error_rate,
        "averageLatency": latency,
        "userComplaints": complaints,
        "healthStatus": health,
        "aiRecommendation": recommendation(health, stage, release.get("riskLevel", "Medium")),
        "createdAt": now(),
        "updatedAt": now(),
    }
    result = await db.rollout_events.insert_one(event)
    event["_id"] = result.inserted_id

    if release.get("status") != "rolling_out":
        await db.releases.update_one({"_id": release["_id"]}, {"$set": {"status": "rolling_out", "updatedAt": now()}})
    await create_audit_log(db, user["id"], release_id, "rollout_stage_simulated", f"Rollout advanced to {stage}% with {health} health.")
    return success(event)
