from fastapi import APIRouter, Depends
from app.database import get_db
from app.security import current_user
from app.utils import success

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
async def dashboard_stats(user=Depends(current_user)):
    db = get_db()
    releases = await db.releases.find({}).sort("createdAt", -1).to_list(100)
    ai_reviews = await db.ai_reviews.find({}).to_list(500)
    incidents = await db.incidents.find({}).to_list(500)

    total = len(releases) or 1
    average_risk = round(sum(release.get("riskScore", 0) for release in releases) / total)

    status_map = {}
    for release in releases:
        status = release.get("status", "pending_review")
        status_map[status] = status_map.get(status, 0) + 1

    incident_map = {}
    for incident in incidents:
        module = incident.get("affectedModule") or "unknown"
        incident_map[module] = incident_map.get(module, 0) + 1

    data = {
        "cards": {
            "totalReleases": len(releases),
            "highRiskReleases": len([r for r in releases if r.get("riskLevel") in ["High Risk", "Critical"]]),
            "successfulRollouts": len([r for r in releases if r.get("status") == "completed"]),
            "failedRollouts": len([r for r in releases if r.get("status") in ["failed", "rolled_back"]]),
            "averageRiskScore": average_risk,
            "aiReviewsGenerated": len(ai_reviews),
        },
        "riskTrend": [{"name": release.get("version"), "riskScore": release.get("riskScore"), "riskLevel": release.get("riskLevel")} for release in reversed(releases)],
        "statusDistribution": [{"name": key, "value": value} for key, value in status_map.items()],
        "incidentsByModule": [{"module": key, "incidents": value} for key, value in incident_map.items()],
        "recentReleases": releases[:6],
    }
    return success(data)
