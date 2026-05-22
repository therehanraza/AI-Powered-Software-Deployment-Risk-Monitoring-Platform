import json
import re
from app.config import settings


def mock_review(release: dict) -> dict:
    modules = ", ".join(release.get("changedModules") or []) or "the changed modules"
    known_issues = release.get("knownIssues") or "No known issues were provided"
    rollback = release.get("rollbackPlan") or "No rollback plan was provided, so release approval should require one before production rollout."
    risk_level = release.get("riskLevel", "Medium")

    return {
        "provider": "mock",
        "model": "mock-structured-release-review",
        "summary": f"{release.get('title')} {release.get('version')} targets {release.get('environment')} with {release.get('deploymentType')} changes across {modules}. Test pass rate is {release.get('testPassPercentage')}%, with {release.get('criticalFilesChanged')} critical files changed.",
        "riskExplanation": f"The release is rated {risk_level} because it combines {release.get('deploymentType')} scope, {release.get('filesChanged')} changed files, {len(release.get('featureFlags') or [])} feature flag updates, and these known issues: {known_issues}.",
        "blastRadius": f"Potential impact is concentrated around {modules}. Business notes indicate: {release.get('businessImpact') or 'standard product impact with no special customer-facing concern noted'}.",
        "rollbackRecommendation": f"Rollback is viable if the team follows this plan: {rollback}" if len(rollback) > 12 else "Pause rollout until a clear rollback owner, trigger, and verification checklist are documented.",
        "stakeholderUpdate": f"{release.get('ownerTeam') or 'The release team'} should communicate that {release.get('title')} is currently {risk_level}, with staged rollout monitoring focused on error rate, latency, and user complaints.",
        "suggestedChecklist": [
            "Confirm test evidence and deployment owner before approval.",
            "Verify rollback steps in staging and identify the rollback decision maker.",
            "Monitor error rate, latency, and support signals at each rollout stage.",
            "Keep feature flags ready for partial disablement if health degrades.",
            "Post a stakeholder update before moving beyond 50% rollout.",
        ],
    }


def _parse_json(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            raise ValueError("Gemini response did not contain JSON")
        return json.loads(match.group(0))


def _normalize(review: dict) -> dict:
    return {
        "provider": review.get("provider", "mock"),
        "model": review.get("model", "mock-structured-release-review"),
        "summary": review.get("summary", "Release summary unavailable."),
        "riskExplanation": review.get("riskExplanation", "Risk explanation unavailable."),
        "blastRadius": review.get("blastRadius", "Blast radius unavailable."),
        "rollbackRecommendation": review.get("rollbackRecommendation", "Rollback recommendation unavailable."),
        "stakeholderUpdate": review.get("stakeholderUpdate", "Stakeholder update unavailable."),
        "suggestedChecklist": review.get("suggestedChecklist") if isinstance(review.get("suggestedChecklist"), list) else ["Review deployment readiness.", "Monitor rollout health.", "Confirm rollback ownership."],
    }


def _prompt(release: dict) -> str:
    return f"""
You are a senior DevOps release risk analyst. Return only valid JSON with this exact shape:
{{
  "summary": "string",
  "riskExplanation": "string",
  "blastRadius": "string",
  "rollbackRecommendation": "string",
  "stakeholderUpdate": "string",
  "suggestedChecklist": ["string"]
}}

Release data:
{json.dumps(release, default=str, indent=2)}
"""


async def _gemini_review(release: dict, model: str, provider: str) -> dict:
    from google import genai

    client = genai.Client(api_key=settings.gemini_api_key)
    response = client.models.generate_content(
        model=model,
        contents=_prompt(release),
        config={"response_mime_type": "application/json"},
    )
    parsed = _parse_json(getattr(response, "text", "") or "")
    parsed["provider"] = provider
    parsed["model"] = model
    return parsed


async def generate_review(release: dict) -> dict:
    if not settings.gemini_api_key:
        return _normalize(mock_review(release))

    try:
        return _normalize(await _gemini_review(release, settings.gemini_model, "gemini"))
    except Exception as error:
        print(f"Gemini main model failed: {error}")

    try:
        return _normalize(await _gemini_review(release, settings.fallback_gemini_model, "fallback-gemini"))
    except Exception as error:
        print(f"Gemini fallback model failed: {error}")
        return _normalize(mock_review(release))
