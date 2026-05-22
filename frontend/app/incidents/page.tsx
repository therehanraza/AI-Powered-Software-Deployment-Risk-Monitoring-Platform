"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ErrorState, LoadingState } from "@/components/ui/State";
import { api, getErrorMessage, unwrap } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Incident, Release } from "@/types";

const severityClass: Record<string, string> = {
  low: "border-app-safe/30 bg-app-safe/10 text-app-safe",
  medium: "border-app-medium/30 bg-app-medium/10 text-app-medium",
  high: "border-app-high/30 bg-app-high/10 text-app-high",
  critical: "border-app-critical/30 bg-app-critical/10 text-app-critical"
};

const statuses: Incident["status"][] = ["open", "investigating", "resolved"];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => api.get("/incidents").then((res) => setIncidents(unwrap<Incident[]>(res))).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    return statuses.reduce<Record<string, Incident[]>>((acc, status) => {
      acc[status] = incidents.filter((incident) => incident.status === status);
      return acc;
    }, {});
  }, [incidents]);

  const createSample = async () => {
    setError("");
    try {
      await api.post("/incidents", {});
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AppShell title="Incidents" subtitle="Severity board for release-linked production issues" action={<Button onClick={createSample}><Plus className="h-4 w-4" />Sample Incident</Button>}>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <div className="grid gap-4 xl:grid-cols-3">
          {statuses.map((status) => (
            <Card key={status}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="capitalize">{status}</CardTitle>
                <Badge className="border-app-border bg-app-panel text-app-muted">{grouped[status]?.length || 0}</Badge>
              </CardHeader>
              <CardContent className="grid gap-3">
                {(grouped[status] || []).map((incident) => <IncidentCard key={incident._id} incident={incident} />)}
                {!grouped[status]?.length && <p className="rounded-lg border border-dashed border-app-border p-5 text-center text-sm text-app-muted">No incidents in this lane.</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  const release = incident.releaseId as Release | undefined;
  return (
    <div className="rounded-lg border border-app-border bg-app-panel/70 p-4">
      <div className="flex flex-wrap gap-2">
        <Badge className={severityClass[incident.severity]}>{incident.severity}</Badge>
        <Badge className="border-app-border bg-app-bg text-app-muted">{incident.affectedModule}</Badge>
      </div>
      <h2 className="mt-3 font-semibold">{incident.title}</h2>
      <p className="mt-1 text-xs text-app-muted">{formatDate(incident.createdAt)}</p>
      <div className="mt-4 text-sm">
        <p className="text-app-muted">Related release</p>
        <p className="mt-1 font-medium">{release?.title || "Unlinked"}</p>
      </div>
      <p className="mt-4 text-sm leading-6 text-app-muted"><span className="font-semibold text-app-text">Root cause:</span> {incident.rootCause}</p>
      <p className="mt-3 rounded-lg border border-app-border bg-app-bg p-3 text-sm leading-6 text-app-muted">{incident.aiSummary}</p>
    </div>
  );
}
