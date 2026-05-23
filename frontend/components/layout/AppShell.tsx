"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, Bot, GitBranch, Home, LogOut, Radio, Settings, ShieldAlert, Siren } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getUser, logout } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/releases", label: "Releases", icon: GitBranch },
  { href: "/rollout", label: "Rollout", icon: Activity },
  { href: "/incidents", label: "Incidents", icon: Siren },
  { href: "/ai-reviews", label: "AI Reviews", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children, title, subtitle, action }: { children: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adrm_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setUser(getUser());
  }, []);

  return (
    <div className="min-h-screen bg-app-bg text-app-text">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-app-border bg-app-card/95 p-4 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-app-primary/40 bg-app-primary/20 text-app-primary">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold leading-tight">AI-Powered Software Deployment Risk Monitoring Platform</p>
            <p className="text-xs text-app-muted">Command Center</p>
          </div>
        </Link>
        <div className="mt-3 rounded-lg border border-app-border bg-app-panel/70 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-app-safe">
            <Radio className="h-3.5 w-3.5" />
            System Online
          </div>
          <p className="mt-2 text-xs leading-5 text-app-muted">Release safety checks, rollout health, and AI reviews in one workspace.</p>
        </div>
        <div className="mt-3 rounded-lg border border-app-cyan/30 bg-app-cyan/10 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-app-cyan">
            <Bot className="h-3.5 w-3.5" />
            Demo Mode
          </div>
          <p className="mt-2 text-xs leading-5 text-app-muted">Mock AI fallback keeps the public demo usable on the free tier.</p>
        </div>
        <nav className="mt-6 grid gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-app-muted transition hover:bg-app-panel hover:text-app-text", active && "bg-app-panel text-app-text")}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-app-border bg-app-bg/90 backdrop-blur">
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-app-cyan">Deployment Command Center</p>
              <h1 className="mt-1 text-xl font-semibold">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-app-muted">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              {action}
              <div className="hidden items-center gap-2 rounded-lg border border-app-cyan/30 bg-app-cyan/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-app-cyan xl:flex">
                <Bot className="h-3.5 w-3.5" />
                Demo Mode
              </div>
              <div className="hidden rounded-lg border border-app-border bg-app-card px-3 py-2 text-sm md:block">
                <p className="font-medium">{user?.name || "Demo User"}</p>
                <p className="text-xs capitalize text-app-muted">{user?.role?.replaceAll("_", " ") || "admin"}</p>
              </div>
              <Button variant="ghost" onClick={logout} title="Logout"><LogOut className="h-4 w-4" /></Button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:hidden">
            {nav.map((item) => {
              const Icon = item.icon;
              return <Link key={item.href} href={item.href} className="flex min-w-fit items-center gap-2 rounded-lg border border-app-border bg-app-card px-3 py-2 text-sm text-app-muted"><Icon className="h-4 w-4" />{item.label}</Link>;
            })}
          </nav>
        </header>
        <div className="px-4 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
