"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, Check, FileWarning, Pause, RotateCcw, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { RiskBadge, StatusBadge } from "@/components/ui/Badge";
import { RiskBar, RiskMeter } from "@/components/ui/RiskMeter";
import { ErrorState, LoadingState } from "@/components/ui/State";
import { api, getErrorMessage, unwrap } from "@/lib/api";
import { estimateRiskBreakdown, formatDate } from "@/lib/utils";
import type { AIReview, AuditLog, Release, ReleaseStatus } from "@/types";

type Details = { release: Release; aiReview: AIReview; auditLogs: AuditLog[] };

export default function ReleaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Details | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = () => api.get(`/releases/${id}`).then((res) => setData(unwrap<Details>(res))).catch((err) => setError(getErrorMessage(err)));
  useEffect(() => { load(); }, [id]);

  const setStatus = async (status: ReleaseStatus) => {
    setBusy(status);
    setError("");
    try {
      await api.patch(`/releases/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy("");
    }
  };

  const breakdown = useMemo(() => data ? estimateRiskBreakdown(data.release) : [], [data]);

  return (
    <AppShell title="Release Details" subtitle="Risk profile, AI readiness report, release actions, and audit timeline">
      {!data && !error && <LoadingState />}
      {error && <ErrorState message={error} />}
      {data && (
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.75fr]">
          <div className="grid gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-xl">{data.release.title}</CardTitle>
                  <p className="mt-2 text-sm text-app-muted">{data.release.version} / {data.release.environment} / {data.release.deploymentType}</p>
                </div>
                <div className="flex flex-wrap gap-2"><RiskBadge level={data.release.riskLevel} /><StatusBadge status={data.release.status} /></div>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
                <div className="flex justify-center">
                  <RiskMeter score={data.release.riskScore} level={data.release.riskLevel} size="lg" />
                </div>
                <div className="grid gap-5">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <Metric label="Tests" value={`${data.release.testPassPercentage}%`} />
                    <Metric label="Files" value={data.release.filesChanged} />
                    <Metric label="Critical" value={data.release.criticalFilesChanged} />
                    <Metric label="Modules" value={data.release.changedModules.length} />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm"><span className="text-app-muted">Readiness pressure</span><span className="font-semibold">{data.release.riskScore}/100</span></div>
                    <RiskBar score={data.release.riskScore} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setStatus("approved")} disabled={!!busy}><ShieldCheck className="h-4 w-4" />Approve</Button>
                    <Button variant="secondary" onClick={() => setStatus("rolling_out")} disabled={!!busy}><Activity className="h-4 w-4" />Start Rollout</Button>
                    <Button variant="secondary" onClick={() => setStatus("paused")} disabled={!!busy}><Pause className="h-4 w-4" />Pause</Button>
                    <Button variant="danger" onClick={() => setStatus("rolled_back")} disabled={!!busy}><RotateCcw className="h-4 w-4" />Rollback</Button>
                    <Button variant="secondary" onClick={() => setStatus("completed")} disabled={!!busy}><Check className="h-4 w-4" />Complete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Risk Breakdown</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {breakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg border border-app-border bg-app-panel/70 p-3">
                    <div className="flex items-center gap-3">
                      <FileWarning className={`h-4 w-4 ${item.tone === "safe" ? "text-app-safe" : item.tone === "watch" ? "text-app-medium" : "text-app-high"}`} />
                      <span className="text-sm text-app-muted">{item.label}</span>
                    </div>
                    <span className={`text-sm font-semibold ${item.points < 0 ? "text-app-safe" : "text-app-high"}`}>{item.points > 0 ? `+${item.points}` : item.points}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Readiness Report</CardTitle>
                <p className="text-sm text-app-muted">{data.aiReview.provider} / {data.aiReview.model}</p>
              </CardHeader>
              <CardContent className="grid gap-5 text-sm leading-6 text-app-muted">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Section title="Release Summary" text={data.aiReview.summary} />
                  <Section title="Blast Radius" text={data.aiReview.blastRadius} />
                  <Section title="Risk Explanation" text={data.aiReview.riskExplanation} />
                  <Section title="Rollback Recommendation" text={data.aiReview.rollbackRecommendation} />
                </div>
                <Section title="Stakeholder Update" text={data.aiReview.stakeholderUpdate} />
                <div>
                  <h3 className="mb-2 font-semibold text-app-text">Suggested Checklist</h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {data.aiReview.suggestedChecklist.map((item) => <li key={item} className="rounded-lg border border-app-border bg-app-panel/70 p-3">{item}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader><CardTitle>Release Inputs</CardTitle></CardHeader>
              <CardContent className="grid gap-4 text-sm">
                <List label="Changed modules" items={data.release.changedModules} />
                <List label="Feature flags" items={data.release.featureFlags} />
                <Section title="Known Issues" text={data.release.knownIssues || "None"} />
                <Section title="Rollback Plan" text={data.release.rollbackPlan || "Missing"} />
                <Section title="Business Impact" text={data.release.businessImpact || "Not provided"} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Audit Timeline</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                {data.auditLogs.map((log) => (
                  <div key={log._id} className="relative rounded-lg border border-app-border bg-app-panel/70 p-3 pl-5">
                    <span className="absolute left-2 top-4 h-2 w-2 rounded-full bg-app-cyan" />
                    <p className="font-medium capitalize">{log.action.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-sm text-app-muted">{log.message}</p>
                    <p className="mt-2 text-xs text-app-muted">{formatDate(log.createdAt)}</p>
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

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg border border-app-border bg-app-panel/70 p-4"><p className="text-xs uppercase tracking-wider text-app-muted">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>;
}

function Section({ title, text }: { title: string; text: string }) {
  return <div><h3 className="font-semibold text-app-text">{title}</h3><p className="mt-1 text-app-muted">{text}</p></div>;
}

function List({ label, items }: { label: string; items: string[] }) {
  return <div><h3 className="font-semibold">{label}</h3><div className="mt-2 flex flex-wrap gap-2">{items.length ? items.map((item) => <span key={item} className="rounded-full border border-app-border bg-app-panel px-3 py-1 text-xs text-app-muted">{item}</span>) : <span className="text-app-muted">None</span>}</div></div>;
}
