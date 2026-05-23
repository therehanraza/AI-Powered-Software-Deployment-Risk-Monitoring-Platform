from app.services.risk import calculate_risk, risk_level


def test_risk_level_boundaries():
    assert risk_level(30) == "Safe"
    assert risk_level(31) == "Medium"
    assert risk_level(55) == "Medium"
    assert risk_level(56) == "High Risk"
    assert risk_level(75) == "High Risk"
    assert risk_level(76) == "Critical"


def test_low_risk_release_scores_safe():
    release = {
        "environment": "preview",
        "deploymentType": "frontend",
        "testPassPercentage": 98,
        "criticalFilesChanged": 0,
        "rollbackPlan": "Revert the frontend bundle.",
        "knownIssues": "",
        "changedModules": ["dashboard"],
        "featureFlags": [],
        "filesChanged": 6,
        "businessImpact": "Internal reporting polish.",
    }

    result = calculate_risk(release)

    assert result["riskLevel"] == "Safe"
    assert result["riskScore"] <= 30


def test_critical_release_caps_at_100():
    release = {
        "environment": "production",
        "deploymentType": "database",
        "testPassPercentage": 58,
        "criticalFilesChanged": 8,
        "rollbackPlan": "",
        "knownIssues": "Migration lock timing needs review.",
        "changedModules": ["orders-db", "payments", "checkout", "billing", "auth"],
        "featureFlags": ["new_payment_flow", "billing_retry", "checkout_v2"],
        "filesChanged": 90,
        "businessImpact": "Payment, checkout, login, and billing paths are affected.",
    }

    result = calculate_risk(release)

    assert result["riskScore"] == 100
    assert result["riskLevel"] == "Critical"
    assert "missing rollback plan" in result["factors"]
    assert "sensitive business impact area" in result["factors"]
