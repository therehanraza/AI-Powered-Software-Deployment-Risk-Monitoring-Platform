import asyncio

from app.config import settings
from app.services.ai import generate_review


def test_generate_review_uses_mock_without_gemini_key(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "")

    release = {
        "title": "Checkout Payment Optimization",
        "version": "v2.1",
        "environment": "production",
        "deploymentType": "backend",
        "changedModules": ["checkout", "payments", "orders"],
        "testPassPercentage": 86,
        "criticalFilesChanged": 2,
        "filesChanged": 34,
        "featureFlags": ["checkout_retry_v2"],
        "knownIssues": "Payment retry logs need close monitoring.",
        "rollbackPlan": "Disable checkout_retry_v2.",
        "ownerTeam": "Payments Platform",
        "businessImpact": "Improves checkout conversion and payment success rate.",
        "riskLevel": "High Risk",
    }

    review = asyncio.run(generate_review(release))

    assert review["provider"] == "mock"
    assert review["model"] == "mock-structured-release-review"
    assert "Checkout Payment Optimization" in review["summary"]
    assert "checkout" in review["blastRadius"]
    assert isinstance(review["suggestedChecklist"], list)
    assert len(review["suggestedChecklist"]) >= 3
