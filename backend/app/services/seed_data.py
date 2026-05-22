from app.security import hash_password
from app.services.ai import mock_review
from app.services.risk import calculate_risk
from app.utils import now

releases_seed = [
    {"title": "Checkout Payment Optimization", "version": "v2.1", "environment": "production", "deploymentType": "backend", "changedModules": ["checkout", "payments", "orders"], "pullRequests": ["https://github.com/demo/app/pull/201"], "featureFlags": ["checkout_retry_v2"], "testPassPercentage": 86, "filesChanged": 34, "criticalFilesChanged": 2, "knownIssues": "Payment gateway retry logs need close monitoring.", "rollbackPlan": "Disable checkout_retry_v2 and redeploy previous payment worker image.", "ownerTeam": "Payments Platform", "businessImpact": "Improves checkout conversion and payment success rate."},
    {"title": "User Login Security Patch", "version": "v1.8.4", "environment": "production", "deploymentType": "backend", "changedModules": ["auth", "sessions", "rate-limiter"], "pullRequests": ["https://github.com/demo/app/pull/198"], "featureFlags": [], "testPassPercentage": 92, "filesChanged": 18, "criticalFilesChanged": 3, "knownIssues": "", "rollbackPlan": "Revert auth middleware image and invalidate only newly issued sessions if needed.", "ownerTeam": "Identity", "businessImpact": "Security patch for login and authentication flow."},
    {"title": "Dashboard Analytics Redesign", "version": "v3.0", "environment": "staging", "deploymentType": "frontend", "changedModules": ["analytics", "dashboard", "charts"], "pullRequests": ["https://github.com/demo/app/pull/187"], "featureFlags": ["analytics_redesign"], "testPassPercentage": 96, "filesChanged": 42, "criticalFilesChanged": 0, "knownIssues": "", "rollbackPlan": "Disable analytics_redesign feature flag.", "ownerTeam": "Growth Product", "businessImpact": "Improves internal reporting views."},
    {"title": "Database Index Migration", "version": "v1.12", "environment": "production", "deploymentType": "database", "changedModules": ["orders-db", "migration-runner"], "pullRequests": ["https://github.com/demo/app/pull/176"], "featureFlags": [], "testPassPercentage": 74, "filesChanged": 12, "criticalFilesChanged": 4, "knownIssues": "Migration duration may exceed maintenance window on large tenants.", "rollbackPlan": "", "ownerTeam": "Data Platform", "businessImpact": "Touches orders and billing query paths."},
    {"title": "AI Prompt Update for Support Bot", "version": "v0.9.7", "environment": "production", "deploymentType": "AI prompt", "changedModules": ["support-bot", "prompt-templates"], "pullRequests": ["https://github.com/demo/app/pull/171"], "featureFlags": ["support_prompt_097"], "testPassPercentage": 81, "filesChanged": 9, "criticalFilesChanged": 1, "knownIssues": "Needs monitoring for escalation accuracy.", "rollbackPlan": "Switch prompt version pointer back to v0.9.6.", "ownerTeam": "Customer Support AI", "businessImpact": "Affects customer support answers and escalation routing."},
    {"title": "Product Search Performance Fix", "version": "v2.4.2", "environment": "preview", "deploymentType": "backend", "changedModules": ["search", "catalog"], "pullRequests": ["https://github.com/demo/app/pull/165"], "featureFlags": [], "testPassPercentage": 98, "filesChanged": 11, "criticalFilesChanged": 0, "knownIssues": "", "rollbackPlan": "Revert search query planner commit.", "ownerTeam": "Catalog", "businessImpact": "Improves search response times."},
    {"title": "Billing Webhook Retry Update", "version": "v1.6.1", "environment": "production", "deploymentType": "full-stack", "changedModules": ["billing", "webhooks", "admin-ui", "notifications"], "pullRequests": ["https://github.com/demo/app/pull/159"], "featureFlags": ["billing_retry_dashboard"], "testPassPercentage": 79, "filesChanged": 57, "criticalFilesChanged": 2, "knownIssues": "Duplicate webhook detection should be watched closely.", "rollbackPlan": "Disable retry worker and revert admin dashboard bundle.", "ownerTeam": "Revenue Systems", "businessImpact": "Impacts billing, invoices, payment retries, and customer notifications."},
    {"title": "Mobile API Gateway Refactor", "version": "v4.3", "environment": "staging", "deploymentType": "infrastructure", "changedModules": ["api-gateway", "mobile-api", "routing", "observability", "auth"], "pullRequests": ["https://github.com/demo/app/pull/150"], "featureFlags": ["mobile_gateway_refactor"], "testPassPercentage": 69, "filesChanged": 76, "criticalFilesChanged": 5, "knownIssues": "Some legacy Android clients need compatibility validation.", "rollbackPlan": "Route mobile traffic back to the old gateway target group.", "ownerTeam": "Platform Edge", "businessImpact": "Affects login and checkout APIs for mobile clients."},
]


async def seed_database(db):
    for collection in ["users", "releases", "ai_reviews", "incidents", "rollout_events", "audit_logs"]:
        await db[collection].delete_many({})

    users = [
        {"name": "Admin User", "email": "admin@example.com", "password": hash_password("password123"), "role": "admin", "createdAt": now(), "updatedAt": now()},
        {"name": "Demo Developer", "email": "developer@example.com", "password": hash_password("password123"), "role": "developer", "createdAt": now(), "updatedAt": now()},
    ]
    user_result = await db.users.insert_many(users)
    admin_id, developer_id = user_result.inserted_ids

    releases = []
    statuses = ["pending_review", "pending_review", "completed", "paused", "pending_review", "completed", "pending_review", "rolling_out"]
    for index, item in enumerate(releases_seed):
        release = {**item, **calculate_risk(item), "status": statuses[index], "createdBy": admin_id if index % 2 == 0 else developer_id, "createdAt": now(), "updatedAt": now()}
        release.pop("factors", None)
        result = await db.releases.insert_one(release)
        release["_id"] = result.inserted_id
        releases.append(release)
        await db.ai_reviews.insert_one({"releaseId": release["_id"], **mock_review(release), "createdAt": now(), "updatedAt": now()})
        await db.audit_logs.insert_one({"userId": release["createdBy"], "releaseId": release["_id"], "action": "created", "message": f"{release['title']} was created and scored {release['riskScore']}/100.", "createdAt": now(), "updatedAt": now()})

    await db.rollout_events.insert_many([
        {"releaseId": releases[0]["_id"], "stagePercentage": 10, "errorRate": 0.8, "averageLatency": 180, "userComplaints": 0, "healthStatus": "healthy", "aiRecommendation": "Metrics look healthy. Continue staged rollout.", "createdAt": now(), "updatedAt": now()},
        {"releaseId": releases[0]["_id"], "stagePercentage": 25, "errorRate": 1.3, "averageLatency": 235, "userComplaints": 1, "healthStatus": "watch", "aiRecommendation": "Continue carefully after 10 minutes of stable payment success rate.", "createdAt": now(), "updatedAt": now()},
        {"releaseId": releases[0]["_id"], "stagePercentage": 50, "errorRate": 2.1, "averageLatency": 310, "userComplaints": 3, "healthStatus": "watch", "aiRecommendation": "Hold at 50% until checkout latency flattens.", "createdAt": now(), "updatedAt": now()},
        {"releaseId": releases[7]["_id"], "stagePercentage": 10, "errorRate": 2.9, "averageLatency": 470, "userComplaints": 4, "healthStatus": "degraded", "aiRecommendation": "Pause and inspect gateway routing before increasing traffic.", "createdAt": now(), "updatedAt": now()},
        {"releaseId": releases[7]["_id"], "stagePercentage": 25, "errorRate": 4.4, "averageLatency": 650, "userComplaints": 9, "healthStatus": "critical", "aiRecommendation": "Rollback is recommended before expanding traffic.", "createdAt": now(), "updatedAt": now()},
        {"releaseId": releases[2]["_id"], "stagePercentage": 100, "errorRate": 0.2, "averageLatency": 140, "userComplaints": 0, "healthStatus": "healthy", "aiRecommendation": "Rollout can be marked completed after final verification.", "createdAt": now(), "updatedAt": now()},
    ])

    await db.incidents.insert_many([
        {"title": "Checkout latency spike", "severity": "high", "releaseId": releases[0]["_id"], "affectedModule": "checkout", "status": "investigating", "rootCause": "Retry worker generated more downstream calls than expected.", "aiSummary": "Keep checkout rollout at 50%, disable retry flag if latency remains elevated, and monitor payment success.", "createdAt": now(), "updatedAt": now()},
        {"title": "Mobile gateway 5xx increase", "severity": "critical", "releaseId": releases[7]["_id"], "affectedModule": "api-gateway", "status": "open", "rootCause": "New route rule affected legacy client headers.", "aiSummary": "Rollback gateway routing for legacy clients and validate Android compatibility before retry.", "createdAt": now(), "updatedAt": now()},
        {"title": "Support bot escalation mismatch", "severity": "medium", "releaseId": releases[4]["_id"], "affectedModule": "support-bot", "status": "investigating", "rootCause": "Prompt changed escalation confidence wording.", "aiSummary": "Monitor escalation quality and switch prompt pointer back if low-confidence responses continue.", "createdAt": now(), "updatedAt": now()},
        {"title": "Analytics chart cache miss", "severity": "low", "releaseId": releases[2]["_id"], "affectedModule": "analytics", "status": "resolved", "rootCause": "Cache key changed during redesign.", "aiSummary": "Resolved after cache warm-up. No customer-facing impact.", "createdAt": now(), "updatedAt": now()},
        {"title": "Webhook duplicate alert", "severity": "medium", "releaseId": releases[6]["_id"], "affectedModule": "billing", "status": "open", "rootCause": "Duplicate detection threshold needs tuning.", "aiSummary": "Keep billing retry dashboard enabled only for internal users until threshold is tuned.", "createdAt": now(), "updatedAt": now()},
    ])

    return {"users": 2, "releases": len(releases), "aiReviews": len(releases), "rolloutEvents": 6, "incidents": 5}
