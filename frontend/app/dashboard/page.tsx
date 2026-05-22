"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle, Gauge, GitBranch, Radio, ShieldAlert, Workflow, XCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { IncidentsBarChart, RiskTrendChart, StatusPieChart } from "@/components/charts/DashboardCharts";
import { ReleasesTable } from "@/components/releases/ReleasesTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CommandStrip } from "@/components/ui/CommandStrip";
import { RiskBadge, StatusBadge } from "@/components/ui/Badge";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { ErrorState, LoadingState } from "@/components/ui/State";
import { api, getErrorMessage, unwrap } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Release, RiskLevel } from "@/types";

type DashboardData = {
  cards: Record<string, number>;
  riskTrend: { name: string; riskScore: number }[];
  statusDistribution: { name: string; value: number }[];
  incidentsByModule: { module: string; incidents: number }[];
  recentReleases: Release[];
};

const levelFor = (score: number): RiskLevel => {
  if (score <= 30) return "Safe";
  if (score <= 55) return "Medium";
  if (score <= 75) return "High Risk";
  return "Critical";
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard/stats").then((res) => setData(unwrap<DashboardData>(res))).catch((err) => setError(getErrorMessage(err)));
  }, []);

  const attention = useMemo(() => {
    return (data?.recentReleases || [])
      .filter((release) => ["High Risk", "Critical"].includes(release.riskLevel) || ["paused", "failed", "rolled_back"].includes(release.status))
      .slice(0, 4);
  }, [data]);

  return (
    <AppShell title="Dashboard" subtitle="Deployment risk, rollout health, and incident overview">
      {error && <ErrorState message={error} />}
      {!data && !error && <LoadingState />}
      {data && (
        <div className="grid gap-6">
          <CommandStrip
            items={[
              { label: "Production posture", value: data.cards.highRiskReleases > 0 ? "Needs review" : "Stable", icon: ShieldAlert, tone: data.cards.highRiskReleases > 0 ? "amber" : "green" },
              { label: "Active releases", value: data.cards.totalReleases, icon: GitBranch, tone: "blue" },
              { label: "AI reviews", value: data.cards.aiReviewsGenerated, icon: Bot, tone: "cyan" },
              { label: "Open signal", value: data.cards.failedRollouts > 0 ? "Incident risk" : "Clear", icon: Radio, tone: data.cards.failedRollouts > 0 ? "red" : "green" }
            ]}
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <StatCard label="Total Releases" value={data.cards.totalReleases} icon={GitBranch} />
            <StatCard label="High Risk" value={data.cards.highRiskReleases} icon={ShieldAlert} />
            <StatCard label="Successful" value={data.cards.successfulRollouts} icon={CheckCircle} />
            <StatCard label="Failed/Rolled Back" value={data.cards.failedRollouts} icon={XCircle} />
            <StatCard label="Avg Risk" value={data.cards.averageRiskScore} icon={Gauge} />
            <StatCard label="AI Reviews" value={data.cards.aiReviewsGenerated} icon={Bot} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
            <div className="grid gap-6">
              <RiskTrendChart data={data.riskTrend} />
              <Card>
                <CardHeader><CardTitle>Recent Releases</CardTitle></CardHeader>
                <CardContent><ReleasesTable releases={data.recentReleases} /></CardContent>
              </Card>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader><CardTitle>Command Focus</CardTitle></CardHeader>
                <CardContent className="grid gap-5">
                  <div className="flex items-center justify-center">
                    <RiskMeter score={data.cards.averageRiskScore} level={levelFor(data.cards.averageRiskScore)} size="lg" />
                  </div>
                  <div className="grid gap-3">
                    {attention.length ? attention.map((release) => (
                      <Link href={`/releases/${release._id}`} key={release._id} className="rounded-lg border border-app-border bg-app-panel/70 p-3 transition hover:border-app-primary">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{release.title}</p>
                            <p className="mt-1 text-xs text-app-muted">{release.version} / {formatDate(release.createdAt)}</p>
                          </div>
                          <RiskBadge level={release.riskLevel} />
                        </div>
                        <div className="mt-3"><StatusBadge status={release.status} /></div>
                      </Link>
                    )) : <p className="rounded-lg border border-app-border bg-app-panel/70 p-4 text-sm text-app-muted">No high-risk releases need attention.</p>}
                  </div>
                </CardContent>
              </Card>
              <StatusPieChart data={data.statusDistribution} />
              <IncidentsBarChart data={data.incidentsByModule} />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Release Governance Workflow</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                {[
                  ["Intake", "Developer enters release metadata, tests, changed files, known issues, rollback plan, and business impact."],
                  ["Risk review", "Backend calculates risk score and stores a structured AI readiness report."],
                  ["Approval", "Release manager approves, starts rollout, pauses, rolls back, or marks completed."],
                  ["Monitoring", "Rollout stages track error rate, latency, complaints, health status, and recommendation."]
                ].map(([title, text], index) => (
                  <div key={title} className="flex gap-3 rounded-lg border border-app-border bg-app-panel/70 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-app-primary/40 bg-app-primary/20 text-sm font-semibold text-app-primary">{index + 1}</div>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-app-muted">{text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Portfolio Highlights</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                {[
                  ["Full-stack APIs", "FastAPI routes, auth dependencies, MongoDB services, seed scripts, and consistent API responses."],
                  ["AI integration", "Gemini provider with fallback Gemini model and Mock AI fallback for free demos."],
                  ["Data modeling", "MongoDB schemas for users, releases, reviews, incidents, rollout events, and audit logs."],
                  ["Product thinking", "Dashboard analytics, release workflow, status actions, health simulation, and incident board."]
                ].map(([title, text]) => (
                  <div key={title} className="rounded-lg border border-app-border bg-app-panel/70 p-4">
                    <div className="flex items-center gap-2">
                      <Workflow className="h-4 w-4 text-app-cyan" />
                      <p className="font-semibold">{title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-app-muted">{text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
