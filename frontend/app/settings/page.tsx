"use client";

import { useEffect, useState } from "react";
import { Bot, CheckCircle, Cloud, Database, Info, KeyRound, Server, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api, API_URL } from "@/lib/api";

type ApiInfo = {
  aiProvider: string;
  geminiModel: string;
  fallbackGeminiModel: string;
};

export default function SettingsPage() {
  const [info, setInfo] = useState<ApiInfo | null>(null);
  const [health, setHealth] = useState("Checking");

  useEffect(() => {
    fetch(API_URL).then((res) => res.json()).then(setInfo).catch(() => setInfo(null));
    api.get("/health").then(() => setHealth("Connected")).catch(() => setHealth("Waking up or unavailable"));
  }, []);

  const usingMock = !info?.aiProvider || info.aiProvider === "mock";

  return (
    <AppShell title="Settings" subtitle="Free-tier runtime, deployment setup, and AI fallback status">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>AI Provider</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Row icon={Bot} label="Current provider" value={info?.aiProvider || "mock"} />
            <Row icon={Server} label="Main Gemini model" value={info?.geminiModel || "gemini-3-flash-preview"} />
            <Row icon={Server} label="Fallback Gemini model" value={info?.fallbackGeminiModel || "gemini-2.5-flash-lite"} />
            <Row icon={CheckCircle} label="GEMINI_API_KEY exists" value={usingMock ? "No or unavailable" : "Yes"} />
            {usingMock && <Badge className="w-fit border-app-medium/30 bg-app-medium/10 text-app-medium">Using Mock AI fallback</Badge>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Fallback Logic</CardTitle></CardHeader>
          <CardContent className="grid gap-4 text-sm leading-6 text-app-muted">
            <p>The app uses Gemini API when available. If the Gemini API key is missing, unavailable, or rate-limited, the system automatically falls back to Mock AI so the deployed demo remains functional and free.</p>
            <div className="rounded-lg border border-app-border bg-app-panel p-4">
              <p className="font-semibold text-app-text">Free-tier note</p>
              <p className="mt-2">Frontend runs on Vercel Hobby, backend on Render free web service, database on MongoDB Atlas M0, AI on Gemini free tier with Mock AI fallback, and source code on GitHub free.</p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-app-border bg-app-panel p-4"><Info className="h-5 w-5 text-app-cyan" /><span>Backend health: {health}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Free Deployment Architecture</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <Row icon={Cloud} label="Frontend hosting" value="Vercel Hobby" />
            <Row icon={Server} label="Backend hosting" value="Render free web service" />
            <Row icon={Database} label="Database" value="MongoDB Atlas M0" />
            <Row icon={KeyRound} label="Secrets" value="Environment variables only" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Deployment Readiness Notes</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm leading-6 text-app-muted">
            {[
              "Set NEXT_PUBLIC_API_URL in Vercel to the Render backend URL.",
              "Set CLIENT_URL in Render to the Vercel frontend URL.",
              "Add MONGO_URI from MongoDB Atlas before seeding demo data.",
              "Leave GEMINI_API_KEY empty if you want the demo to run with Mock AI fallback.",
              "Run the seed endpoint once after connecting MongoDB Atlas."
            ].map((item) => <div key={item} className="rounded-lg border border-app-border bg-app-panel p-3">{item}</div>)}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-lg border border-app-border bg-app-panel p-4"><div className="flex items-center gap-3"><Icon className="h-5 w-5 text-app-cyan" /><span className="text-app-muted">{label}</span></div><span className="text-right font-semibold">{value}</span></div>;
}
