import re


def risk_level(score: int) -> str:
    if score <= 30:
        return "Safe"
    if score <= 55:
        return "Medium"
    if score <= 75:
        return "High Risk"
    return "Critical"


def calculate_risk(release: dict) -> dict:
    score = 10
    factors: list[str] = []
    deployment_type = release.get("deploymentType")
    business_impact = str(release.get("businessImpact", "")).lower()

    if release.get("environment") == "production":
        score += 18
        factors.append("production deployment")
    if deployment_type == "database":
        score += 18
        factors.append("database changes")
    if deployment_type == "infrastructure":
        score += 16
        factors.append("infrastructure changes")
    if deployment_type == "AI prompt":
        score += 12
        factors.append("AI prompt/model behavior changes")
    if deployment_type == "full-stack":
        score += 12
        factors.append("full-stack surface area")

    test_pass = float(release.get("testPassPercentage") or 0)
    if test_pass < 60:
        score += 28
    elif test_pass < 80:
        score += 20
    elif test_pass < 90:
        score += 8
    else:
        score -= 5

    critical_files = int(release.get("criticalFilesChanged") or 0)
    score += min(20, critical_files * 6)
    if critical_files:
        factors.append(f"{critical_files} critical file changes")

    if not str(release.get("rollbackPlan", "")).strip():
        score += 22
        factors.append("missing rollback plan")
    if str(release.get("knownIssues", "")).strip():
        score += 12
        factors.append("known issues")

    modules = release.get("changedModules") or []
    if len(modules) >= 5:
        score += 12
    elif len(modules) >= 3:
        score += 7

    flags = release.get("featureFlags") or []
    if flags:
        score += min(12, len(flags) * 4)

    files_changed = int(release.get("filesChanged") or 0)
    if files_changed > 60:
        score += 10
    elif files_changed > 25:
        score += 5

    if re.search(r"payment|login|checkout|security|billing|authentication|auth", business_impact):
        score += 15
        factors.append("sensitive business impact area")

    risk_score = max(0, min(100, round(score)))
    return {"riskScore": risk_score, "riskLevel": risk_level(risk_score), "factors": factors}
