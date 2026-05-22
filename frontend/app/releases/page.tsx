"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle, GitBranch, Plus, ShieldAlert, Timer } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ReleasesTable } from "@/components/releases/ReleasesTable";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CommandStrip } from "@/components/ui/CommandStrip";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/State";
import { api, getErrorMessage, unwrap } from "@/lib/api";
import type { Release } from "@/types";

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/releases").then((res) => setReleases(unwrap<Release[]>(res))).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => ({
    total: releases.length,
    highRisk: releases.filter((release) => ["High Risk", "Critical"].includes(release.riskLevel)).length,
    completed: releases.filter((release) => release.status === "completed").length,
    pending: releases.filter((release) => release.status === "pending_review").length
  }), [releases]);

  return (
    <AppShell title="Releases" subtitle="Create, review, approve, and monitor deployments" action={<Link href="/releases/new"><Button><Plus className="h-4 w-4" />New Release</Button></Link>}>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <div className="grid gap-6">
          <CommandStrip
            items={[
              { label: "Total releases", value: summary.total, icon: GitBranch, tone: "blue" },
              { label: "High risk", value: summary.highRisk, icon: ShieldAlert, tone: summary.highRisk ? "amber" : "green" },
              { label: "Completed", value: summary.completed, icon: CheckCircle, tone: "green" },
              { label: "Pending review", value: summary.pending, icon: Timer, tone: "cyan" }
            ]}
          />
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <Card><CardContent>{releases.length ? <ReleasesTable releases={releases} /> : <EmptyState title="No releases yet" description="Create your first release to generate a risk score and AI review." />}</CardContent></Card>
            <Card>
              <CardHeader><CardTitle>Release Review Checklist</CardTitle></CardHeader>
              <CardContent className="grid gap-3 text-sm leading-6 text-app-muted">
                {[
                  "Confirm the release has a rollback plan before production approval.",
                  "Review test pass percentage and critical file count.",
                  "Check business impact for payment, login, checkout, billing, auth, or security keywords.",
                  "Use rollout simulation before marking a risky release completed.",
                  "Create an incident if rollout health becomes degraded or critical."
                ].map((item) => <div key={item} className="rounded-lg border border-app-border bg-app-panel/70 p-3">{item}</div>)}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Release Lifecycle Demonstrated</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-5">
              {["Draft intake", "Risk scoring", "AI review", "Staged rollout", "Audit and incident tracking"].map((item, index) => (
                <div key={item} className="rounded-lg border border-app-border bg-app-panel/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-app-cyan">Step {index + 1}</p>
                  <p className="mt-2 font-semibold">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
