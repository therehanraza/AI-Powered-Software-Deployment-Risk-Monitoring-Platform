"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { RiskMeter, RiskBar } from "@/components/ui/RiskMeter";
import { estimateRiskBreakdown } from "@/lib/utils";
import { api, getErrorMessage, unwrap } from "@/lib/api";
import type { Release, RiskLevel } from "@/types";

const initial = {
  title: "Checkout Payment Optimization",
  version: "v2.1",
  environment: "production",
  deploymentType: "backend",
  changedModules: "checkout, payments, orders",
  pullRequests: "https://github.com/demo/app/pull/201",
  featureFlags: "checkout_retry_v2",
  testPassPercentage: 86,
  filesChanged: 34,
  criticalFilesChanged: 2,
  knownIssues: "Payment gateway retry logs need close monitoring.",
  rollbackPlan: "Disable checkout_retry_v2 and redeploy previous payment worker image.",
  ownerTeam: "Payments Platform",
  businessImpact: "Improves checkout conversion and payment success rate."
};

const split = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

const levelFor = (score: number): RiskLevel => {
  if (score <= 30) return "Safe";
  if (score <= 55) return "Medium";
  if (score <= 75) return "High Risk";
  return "Critical";
};

export default function NewReleasePage() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (key: string, value: string | number) => setForm((prev) => ({ ...prev, [key]: value }));

  const preview = useMemo(() => {
    const releasePreview = {
      environment: form.environment as Release["environment"],
      deploymentType: form.deploymentType as Release["deploymentType"],
      testPassPercentage: form.testPassPercentage,
      filesChanged: form.filesChanged,
      criticalFilesChanged: form.criticalFilesChanged,
      knownIssues: form.knownIssues,
      rollbackPlan: form.rollbackPlan,
      businessImpact: form.businessImpact,
      changedModules: split(form.changedModules),
      featureFlags: split(form.featureFlags)
    };
    const breakdown = estimateRiskBreakdown(releasePreview);
    const score = Math.max(0, Math.min(100, Math.round(10 + breakdown.reduce((sum, item) => sum + item.points, 0))));
    return { score, level: levelFor(score), breakdown };
  }, [form]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = unwrap<{ release: Release }>(await api.post("/releases", form));
      router.push(`/releases/${data.release._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Create Release" subtitle="Professional release intake with live risk preview">
      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_360px] xl:items-start">
        <div className="grid gap-6">
          <FormSection title="Release Identity">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Release title"><Input value={form.title} onChange={(e) => update("title", e.target.value)} required /></Field>
              <Field label="Version"><Input value={form.version} onChange={(e) => update("version", e.target.value)} required /></Field>
              <Field label="Environment"><Select value={form.environment} onChange={(e) => update("environment", e.target.value)}><option>staging</option><option>production</option><option>preview</option></Select></Field>
              <Field label="Owner/team"><Input value={form.ownerTeam} onChange={(e) => update("ownerTeam", e.target.value)} /></Field>
            </div>
          </FormSection>

          <FormSection title="Deployment Scope">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Deployment type"><Select value={form.deploymentType} onChange={(e) => update("deploymentType", e.target.value)}><option>frontend</option><option>backend</option><option>database</option><option>AI prompt</option><option>infrastructure</option><option>full-stack</option></Select></Field>
              <Field label="Files changed"><Input type="number" min={0} value={form.filesChanged} onChange={(e) => update("filesChanged", Number(e.target.value))} /></Field>
              <Field label="Critical files changed"><Input type="number" min={0} value={form.criticalFilesChanged} onChange={(e) => update("criticalFilesChanged", Number(e.target.value))} /></Field>
              <Field label="Test pass percentage"><Input type="number" min={0} max={100} value={form.testPassPercentage} onChange={(e) => update("testPassPercentage", Number(e.target.value))} /></Field>
            </div>
            <Field label="Changed modules"><Input value={form.changedModules} onChange={(e) => update("changedModules", e.target.value)} /></Field>
            <Field label="Pull request links"><Input value={form.pullRequests} onChange={(e) => update("pullRequests", e.target.value)} /></Field>
            <Field label="Feature flags changed"><Input value={form.featureFlags} onChange={(e) => update("featureFlags", e.target.value)} /></Field>
          </FormSection>

          <FormSection title="Risk Controls">
            <Field label="Known issues"><Textarea value={form.knownIssues} onChange={(e) => update("knownIssues", e.target.value)} /></Field>
            <Field label="Rollback plan"><Textarea value={form.rollbackPlan} onChange={(e) => update("rollbackPlan", e.target.value)} /></Field>
            <Field label="Business impact notes"><Textarea value={form.businessImpact} onChange={(e) => update("businessImpact", e.target.value)} /></Field>
          </FormSection>
        </div>

        <Card className="xl:sticky xl:top-24">
          <CardHeader><CardTitle>Live Risk Preview</CardTitle></CardHeader>
          <CardContent className="grid gap-5">
            <div className="flex justify-center"><RiskMeter score={preview.score} level={preview.level} size="lg" /></div>
            <RiskBar score={preview.score} />
            <div className="grid gap-2">
              {preview.breakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-app-border bg-app-panel/70 px-3 py-2 text-sm">
                  <span className="text-app-muted">{item.label}</span>
                  <span className={item.points < 0 ? "font-semibold text-app-safe" : "font-semibold text-app-high"}>{item.points > 0 ? `+${item.points}` : item.points}</span>
                </div>
              ))}
            </div>
            {error && <p className="rounded-lg border border-app-critical/30 bg-app-critical/10 p-3 text-sm text-app-critical">{error}</p>}
            <Button disabled={loading}>{loading ? "Analyzing release..." : "Create release and AI review"}</Button>
          </CardContent>
        </Card>
      </form>
    </AppShell>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  );
}
