"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { demoLogin, login } from "@/lib/auth";
import { getErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const demo = async (demoEmail: string) => {
    setLoading(true);
    setError("");
    try {
      await demoLogin(demoEmail);
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-10 text-app-text">
      <Card className="w-full max-w-md">
        <CardHeader><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary"><ShieldCheck /></div><CardTitle>Login to AI-Powered Software Deployment Risk Monitoring Platform</CardTitle><p className="text-sm text-app-muted">Use seeded demo credentials or create your own account.</p></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4">
            <Field label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></Field>
            <Field label="Password"><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required /></Field>
            {error && <p className="rounded-lg border border-app-critical/30 bg-app-critical/10 p-3 text-sm text-app-critical">{error}</p>}
            <Button disabled={loading}>{loading ? "Signing in..." : "Login"}</Button>
          </form>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => demo("admin@example.com")} disabled={loading}>Admin demo</Button>
            <Button variant="secondary" onClick={() => demo("developer@example.com")} disabled={loading}>Developer demo</Button>
          </div>
          <p className="mt-5 text-center text-sm text-app-muted">No account? <Link className="text-app-cyan" href="/signup">Create one</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}
