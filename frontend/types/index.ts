export type RiskLevel = "Safe" | "Medium" | "High Risk" | "Critical";
export type ReleaseStatus = "draft" | "pending_review" | "approved" | "rolling_out" | "paused" | "rolled_back" | "completed" | "failed";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "developer" | "release_manager" | "admin";
};

export type Release = {
  _id: string;
  title: string;
  version: string;
  environment: "staging" | "production" | "preview";
  deploymentType: "frontend" | "backend" | "database" | "AI prompt" | "infrastructure" | "full-stack";
  changedModules: string[];
  pullRequests: string[];
  featureFlags: string[];
  testPassPercentage: number;
  filesChanged: number;
  criticalFilesChanged: number;
  knownIssues: string;
  rollbackPlan: string;
  ownerTeam: string;
  businessImpact: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: ReleaseStatus;
  createdAt: string;
  updatedAt: string;
};

export type AIReview = {
  _id: string;
  releaseId: Release | string;
  provider: "gemini" | "fallback-gemini" | "mock";
  model: string;
  summary: string;
  riskExplanation: string;
  blastRadius: string;
  rollbackRecommendation: string;
  stakeholderUpdate: string;
  suggestedChecklist: string[];
  createdAt: string;
};

export type Incident = {
  _id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  releaseId?: Release | string;
  affectedModule: string;
  status: "open" | "investigating" | "resolved";
  rootCause: string;
  aiSummary: string;
  createdAt: string;
};

export type RolloutEvent = {
  _id: string;
  releaseId: string;
  stagePercentage: number;
  errorRate: number;
  averageLatency: number;
  userComplaints: number;
  healthStatus: "healthy" | "watch" | "degraded" | "critical";
  aiRecommendation: string;
  createdAt: string;
};

export type AuditLog = {
  _id: string;
  action: string;
  message: string;
  createdAt: string;
  userId?: { name: string; email: string };
};
