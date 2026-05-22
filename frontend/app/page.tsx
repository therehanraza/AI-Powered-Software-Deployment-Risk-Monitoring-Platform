"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Bot,
  CheckCircle,
  Cloud,
  Database,
  Gauge,
  GitBranch,
  Layers3,
  Radio,
  Server,
  ShieldCheck,
  Siren,
  Workflow
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RiskBar, RiskMeter } from "@/components/ui/RiskMeter";
import { demoLogin } from "@/lib/auth";

const features = [
  { icon: Gauge, title: "Risk scoring", text: "Scores release safety from environment, tests, modules, flags, rollback plan, and business impact." },
  { icon: Bot, title: "Structured AI review", text: "Generates release summary, blast radius, rollback recommendation, stakeholder update, and checklist." },
  { icon: Activity, title: "Rollout simulation", text: "Models 10%, 25%, 50%, 75%, and 100% traffic stages with realistic health signals." },
  { icon: Siren, title: "Incident tracking", text: "Links production issues to releases and captures severity, root cause, and AI summaries." },
  { icon: Workflow, title: "Audit timeline", text: "Tracks release actions such as approval, rollout start, pause, rollback, and completion." },
  { icon: Cloud, title: "Free deployment", text: "Designed for Vercel Hobby, Render free web service, MongoDB Atlas M0, and Gemini free tier." }
];

const workflow = [
  ["1", "Create release", "Enter modules, tests, files, rollback plan, feature flags, and business impact."],
  ["2", "Calculate risk", "The backend applies a transparent 0-100 rule-based scoring model."],
  ["3", "Generate AI report", "Gemini or Mock AI returns structured release summary, blast radius, and checklist."],
  ["4", "Simulate rollout", "Traffic advances through 10%, 25%, 50%, 75%, and 100% health stages."],
  ["5", "Track incidents", "Incidents stay linked to releases, modules, root cause, and AI summaries."]
];

const architecture = [
  { icon: Layers3, title: "Frontend", text: "Next.js, React, TypeScript, Tailwind CSS, Recharts, Lucide React, Axios." },
  { icon: Server, title: "Backend", text: "Python, FastAPI, Uvicorn, JWT auth, bcrypt, CORS, REST APIs." },
  { icon: Database, title: "Database", text: "MongoDB Atlas M0 with Motor/PyMongo collections for users, releases, incidents, rollout events, AI reviews, and audit logs." },
  { icon: Bot, title: "AI layer", text: "Gemini primary model, fallback Gemini model, and Mock AI fallback so the demo stays functional without paid APIs." }
];

const riskRows = [
  ["Production deployment", "+18", "Higher customer-facing impact"],
  ["Database or infrastructure", "+16 to +18", "Harder rollback and wider blast radius"],
  ["Tests below 80%", "+20", "Readiness risk increases heavily"],
  ["Missing rollback plan", "+22", "Approval should be blocked until recovery path exists"],
  ["Payment/login/security impact", "+15", "Sensitive business flow needs extra caution"]
];

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const openDemo = async () => {
    setLoading("dashboard");
    setError("");
    try {
      await demoLogin();
      router.push("/dashboard");
    } catch {
      setError("Backend or MongoDB is not ready yet. Check backend/.env and start the API.");
      setLoading("");
    }
  };

  const createRelease = async () => {
    setLoading("release");
    setError("");
    try {
      await demoLogin();
      router.push("/releases/new");
    } catch {
      setError("Backend or MongoDB is not ready yet. Check backend/.env and start the API.");
      setLoading("");
    }
  };

  return (
    <main className="min-h-screen bg-app-bg text-app-text">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-app-primary/40 bg-app-primary/20">
            <ShieldCheck className="h-5 w-5 text-app-primary" />
          </div>
          <div>
            <span className="font-semibold">AI-Powered Software Deployment Risk Monitoring Platform</span>
            <p className="text-xs text-app-muted">Deployment Command Center</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/login"><Button variant="secondary">Login</Button></Link>
          <Link href="/signup"><Button>Sign up</Button></Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-app-border bg-app-card px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-app-cyan">
            <Radio className="h-3.5 w-3.5" />
            Release Safety Command Center
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">Prevent risky deployments before they hit production.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-app-muted">
            A full-stack portfolio project for deployment risk scoring, AI release analysis, rollout monitoring, incident tracking, authentication, dashboards, and free-tier deployment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={openDemo} disabled={!!loading}>{loading === "dashboard" ? "Opening..." : "Open Demo Dashboard"}</Button>
            <Button variant="secondary" onClick={createRelease} disabled={!!loading}><GitBranch className="h-4 w-4" />{loading === "release" ? "Opening..." : "Create Release"}</Button>
          </div>
          {error && <p className="mt-4 max-w-xl rounded-lg border border-app-medium/30 bg-app-medium/10 p-3 text-sm text-app-medium">{error}</p>}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <HeroStat label="Risk model" value="0-100" />
            <HeroStat label="Rollout stages" value="5" />
            <HeroStat label="Demo releases" value="8" />
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-app-border bg-app-panel p-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-app-muted">Live release review</p>
                <p className="mt-1 font-semibold">Checkout Payment Optimization</p>
              </div>
              <Badge className="border-app-high/30 bg-app-high/10 text-app-high">High Risk</Badge>
            </div>
            <div className="grid gap-5 p-5">
              <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
                <RiskMeter score={72} level="High Risk" size="lg" />
                <div className="grid gap-3">
                  <Metric label="Environment" value="production" />
                  <Metric label="Tests" value="86% passed" />
                  <Metric label="Critical files" value="2 changed" />
                  <Metric label="Rollback" value="feature flag ready" />
                </div>
              </div>
              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-app-muted">Rollout path</p>
                <div className="grid grid-cols-5 gap-2">
                  {[10, 25, 50, 75, 100].map((stage, index) => (
                    <div key={stage} className={`rounded-lg border p-3 text-center text-sm font-semibold ${index < 3 ? "border-app-safe/30 bg-app-safe/10 text-app-safe" : index === 3 ? "border-app-high/30 bg-app-high/10 text-app-high" : "border-app-border bg-app-panel text-app-muted"}`}>
                      {stage}%
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-app-border bg-app-bg p-4">
                <div className="mb-3 flex items-center justify-between text-sm"><span className="text-app-muted">Risk pressure</span><span className="font-semibold">72/100</span></div>
                <RiskBar score={72} />
                <p className="mt-3 text-sm leading-6 text-app-muted">AI recommends holding at 50% until payment latency and retry logs stabilize.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:grid-cols-3">
        {[
          ["Problem", "Release context is scattered across PRs, tests, flags, incidents, and rollback notes."],
          ["Solution", "The system turns release inputs into a readable safety decision, AI readiness report, and rollout plan."],
          ["Free stack", "Next.js, Python FastAPI, MongoDB Atlas M0, Render, Vercel, Gemini free tier, and Mock AI fallback."]
        ].map(([title, text]) => (
          <Card key={title}><CardContent><p className="text-sm font-semibold text-app-cyan">{title}</p><p className="mt-3 leading-6 text-app-muted">{text}</p></CardContent></Card>
        ))}
      </section>

      <SectionHeader eyebrow="Product modules" title="A bigger portfolio app with real SaaS surfaces" text="The project includes more than one dashboard screen. It demonstrates CRUD flows, protected routes, analytics, AI integration, simulations, and deployment-ready documentation." />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardContent>
              <feature.icon className="h-6 w-6 text-app-cyan" />
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-app-muted">{feature.text}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <SectionHeader eyebrow="Workflow" title="How a release moves through the system" text="The UI is built around a practical release manager workflow, which makes the project easier to explain in interviews." />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-5">
        {workflow.map(([number, title, text]) => (
          <Card key={number}>
            <CardContent>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-app-primary/40 bg-app-primary/20 text-sm font-semibold text-app-primary">{number}</div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-app-muted">{text}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <SectionHeader eyebrow="Architecture" title="Built as a real full-stack system" text="The frontend and backend are separated like a deployable SaaS product, with free-tier services and graceful fallback behavior." />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-2">
        {architecture.map((item) => (
          <Card key={item.title}>
            <CardContent className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-app-border bg-app-panel">
                <item.icon className="h-6 w-6 text-app-cyan" />
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-app-muted">{item.text}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <SectionHeader eyebrow="Risk engine" title="Transparent scoring that interviewers can understand" text="The risk score is not random. It uses explainable rules so the backend logic is easy to discuss." />
      <section className="mx-auto max-w-7xl px-4 py-6">
        <Card>
          <CardHeader><CardTitle>Risk Scoring Examples</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase text-app-muted">
                  <tr>
                    <th className="border-b border-app-border px-4 py-3">Factor</th>
                    <th className="border-b border-app-border px-4 py-3">Score impact</th>
                    <th className="border-b border-app-border px-4 py-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {riskRows.map(([factor, points, reason]) => (
                    <tr key={factor}>
                      <td className="px-4 py-4 font-medium">{factor}</td>
                      <td className="px-4 py-4 text-app-high">{points}</td>
                      <td className="px-4 py-4 text-app-muted">{reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 rounded-lg border border-app-border bg-app-card p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-app-cyan">Portfolio-ready demo</p>
            <h2 className="mt-3 text-3xl font-semibold">Show authentication, APIs, AI fallback, analytics, simulation, and deployment planning in one project.</h2>
            <p className="mt-4 max-w-3xl leading-7 text-app-muted">Use the demo dashboard to walk through release creation, AI review generation, rollout monitoring, incident tracking, and free deployment architecture.</p>
          </div>
          <Button onClick={openDemo}>Open Demo Dashboard</Button>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm"><span className="text-app-muted">{label}</span><span className="font-semibold">{value}</span></div>;
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-app-border bg-app-card p-4"><p className="text-xs uppercase tracking-wider text-app-muted">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>;
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-app-cyan">{eyebrow}</p>
      <h2 className="mt-3 max-w-3xl text-3xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-3xl leading-7 text-app-muted">{text}</p>
    </div>
  );
}
