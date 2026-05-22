"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, Radio } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/Badge";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/State";
import { api, getErrorMessage, unwrap } from "@/lib/api";
import type { Release, RolloutEvent } from "@/types";

const stages = [10, 25, 50, 75, 100];

const healthClass: Record<string, string> = {
  healthy: "border-app-safe/30 bg-app-safe/10 text-app-safe",
  watch: "border-app-medium/30 bg-app-medium/10 text-app-medium",
  degraded: "border-app-high/30 bg-app-high/10 text-app-high",
  critical: "border-app-critical/30 bg-app-critical/10 text-app-critical"
};

export default function RolloutPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [selected, setSelected] = useState("");
  const [events, setEvents] = useState<RolloutEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = (releaseId: string) => api.get(`/rollout/${releaseId}`).then((res) => setEvents(unwrap<RolloutEvent[]>(res)));

  useEffect(() => {
    api.get("/releases").then(async (res) => {
      const items = unwrap<Release[]>(res);
      setReleases(items);
      const first = items.find((r) => r.status === "rolling_out") || items[0];
      if (first) {
        setSelected(first._id);
        await loadEvents(first._id);
      }
    }).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  }, []);

  const simulate = async () => {
    if (!selected) return;
    setError("");
    try {
      await api.post(`/rollout/${selected}/simulate`);
      await loadEvents(selected);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const release = releases.find((item) => item._id === selected);
  const latest = events[events.length - 1];
  const eventByStage = useMemo(() => new Map(events.map((event) => [event.stagePercentage, event])), [events]);

  return (
    <AppShell title="Rollout Monitor" subtitle="Control staged traffic expansion with health signals and AI recommendations">
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <div className="grid gap-6">
          <Card>
            <CardContent className="grid gap-5 lg:grid-cols-[1fr_auto_auto] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-app-muted">Selected release</p>
                <select className="mt-2 w-full rounded-lg border border-app-border bg-app-panel px-3 py-2 lg:max-w-xl" value={selected} onChange={async (e) => { setSelected(e.target.value); await loadEvents(e.target.value); }}>
                  {releases.map((r) => <option key={r._id} value={r._id}>{r.title} {r.version}</option>)}
                </select>
              </div>
              {release && <div className="flex items-center gap-4"><RiskMeter score={release.riskScore} level={release.riskLevel} size="sm" /><RiskBadge level={release.riskLevel} /></div>}
              <Button onClick={simulate} disabled={!selected || events.length >= 5}><Play className="h-4 w-4" />Simulate Next Stage</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Traffic Stage Rail</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-5">
                {stages.map((stage) => {
                  const event = eventByStage.get(stage);
                  return (
                    <div key={stage} className={`rounded-lg border p-4 ${event ? healthClass[event.healthStatus] : "border-app-border bg-app-panel/70 text-app-muted"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xl font-semibold">{stage}%</p>
                        <Radio className="h-4 w-4" />
                      </div>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wider">{event?.healthStatus || "pending"}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {events.length === 0 ? <EmptyState title="No rollout events yet" description="Simulate the first stage to generate health metrics and an AI recommendation." /> : (
            <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
              <div className="grid gap-4 md:grid-cols-2">
                {events.map((event) => (
                  <Card key={event._id}>
                    <CardHeader><CardTitle>{event.stagePercentage}% Stage</CardTitle><p className={`mt-2 w-fit rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${healthClass[event.healthStatus]}`}>{event.healthStatus}</p></CardHeader>
                    <CardContent className="grid gap-3 text-sm">
                      <Metric label="Error rate" value={`${event.errorRate}%`} />
                      <Metric label="Avg latency" value={`${event.averageLatency}ms`} />
                      <Metric label="User complaints" value={event.userComplaints} />
                      <p className="rounded-lg border border-app-border bg-app-panel/70 p-3 leading-6 text-app-muted">{event.aiRecommendation}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader><CardTitle>Current Recommendation</CardTitle></CardHeader>
                <CardContent>
                  {latest ? (
                    <div className="grid gap-4">
                      <p className={`w-fit rounded-full border px-3 py-1 text-sm font-semibold capitalize ${healthClass[latest.healthStatus]}`}>{latest.healthStatus}</p>
                      <p className="text-2xl font-semibold">{latest.stagePercentage}% rollout</p>
                      <p className="leading-7 text-app-muted">{latest.aiRecommendation}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="flex items-center justify-between rounded-lg border border-app-border bg-app-panel/70 px-3 py-2"><span className="text-app-muted">{label}</span><span className="font-semibold">{value}</span></div>;
}
