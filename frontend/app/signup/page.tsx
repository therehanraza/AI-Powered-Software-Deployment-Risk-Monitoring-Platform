"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { signup } from "@/lib/auth";
import { getErrorMessage } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "developer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signup(form);
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
        <CardHeader><CardTitle>Create account</CardTitle><p className="text-sm text-app-muted">JWT auth with bcrypt password hashing on the Python FastAPI backend.</p></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required /></Field>
            <Field label="Password"><Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required minLength={6} /></Field>
            <Field label="Role"><Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="developer">Developer</option><option value="release_manager">Release Manager</option><option value="admin">Admin</option></Select></Field>
            {error && <p className="rounded-lg border border-app-critical/30 bg-app-critical/10 p-3 text-sm text-app-critical">{error}</p>}
            <Button disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
          </form>
          <p className="mt-5 text-center text-sm text-app-muted">Already have an account? <Link className="text-app-cyan" href="/login">Login</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}
