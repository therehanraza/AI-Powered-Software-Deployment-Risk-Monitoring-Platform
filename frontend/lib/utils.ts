import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Release, RiskLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const riskClasses: Record<RiskLevel, string> = {
  Safe: "border-app-safe/30 bg-app-safe/10 text-app-safe",
  Medium: "border-app-medium/30 bg-app-medium/10 text-app-medium",
  "High Risk": "border-app-high/30 bg-app-high/10 text-app-high",
  Critical: "border-app-critical/30 bg-app-critical/10 text-app-critical"
};

export const statusClasses: Record<string, string> = {
  draft: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  pending_review: "border-app-medium/30 bg-app-medium/10 text-app-medium",
  approved: "border-app-cyan/30 bg-app-cyan/10 text-app-cyan",
  rolling_out: "border-app-primary/30 bg-app-primary/10 text-app-primary",
  paused: "border-app-high/30 bg-app-high/10 text-app-high",
  rolled_back: "border-app-critical/30 bg-app-critical/10 text-app-critical",
  completed: "border-app-safe/30 bg-app-safe/10 text-app-safe",
  failed: "border-app-critical/30 bg-app-critical/10 text-app-critical"
};

export function formatDate(value?: string) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function label(value: string) {
  return value.replaceAll("_", " ");
}

export function riskTone(score: number) {
  if (score <= 30) return "#22C55E";
  if (score <= 55) return "#F59E0B";
  if (score <= 75) return "#F97316";
  return "#EF4444";
}

export function estimateRiskBreakdown(release: Partial<Release>) {
  const items: { label: string; points: number; tone: "safe" | "watch" | "risk" }[] = [];
  if (release.environment === "production") items.push({ label: "Production environment", points: 18, tone: "risk" });
  if (release.deploymentType === "database") items.push({ label: "Database deployment", points: 18, tone: "risk" });
  if (release.deploymentType === "infrastructure") items.push({ label: "Infrastructure changes", points: 16, tone: "risk" });
  if (release.deploymentType === "AI prompt") items.push({ label: "AI prompt behavior change", points: 12, tone: "watch" });
  if (release.deploymentType === "full-stack") items.push({ label: "Full-stack surface area", points: 12, tone: "watch" });

  const tests = Number(release.testPassPercentage || 0);
  if (tests >= 90) items.push({ label: "Strong test pass rate", points: -5, tone: "safe" });
  else if (tests < 60) items.push({ label: "Tests below 60%", points: 28, tone: "risk" });
  else if (tests < 80) items.push({ label: "Tests below 80%", points: 20, tone: "risk" });
  else if (tests < 90) items.push({ label: "Tests below 90%", points: 8, tone: "watch" });

  const criticalFiles = Number(release.criticalFilesChanged || 0);
  if (criticalFiles > 0) items.push({ label: `${criticalFiles} critical files changed`, points: Math.min(20, criticalFiles * 6), tone: "risk" });
  if (!String(release.rollbackPlan || "").trim()) items.push({ label: "Missing rollback plan", points: 22, tone: "risk" });
  if (String(release.knownIssues || "").trim()) items.push({ label: "Known issues declared", points: 12, tone: "watch" });
  if ((release.changedModules || []).length >= 3) items.push({ label: "Multiple modules changed", points: (release.changedModules || []).length >= 5 ? 12 : 7, tone: "watch" });
  if ((release.featureFlags || []).length > 0) items.push({ label: "Feature flags changed", points: Math.min(12, (release.featureFlags || []).length * 4), tone: "watch" });
  if (/(payment|login|checkout|security|billing|authentication|auth)/i.test(String(release.businessImpact || ""))) {
    items.push({ label: "Sensitive business flow", points: 15, tone: "risk" });
  }
  return items.slice(0, 8);
}
