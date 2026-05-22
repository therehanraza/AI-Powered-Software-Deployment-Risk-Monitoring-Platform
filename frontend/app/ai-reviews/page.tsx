"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { RiskBadge, Badge } from "@/components/ui/Badge";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { ErrorState, LoadingState } from "@/components/ui/State";
import { api, getErrorMessage, unwrap } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { AIReview, Release } from "@/types";

export default function AIReviewsPage() {
  const [reviews, setReviews] = useState<AIReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = () => api.get("/ai-reviews").then((res) => setReviews(unwrap<AIReview[]>(res))).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const regenerate = async (releaseId: string) => {
    setBusy(releaseId);
    setError("");
    try {
      await api.post(`/ai-reviews/${releaseId}/regenerate`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy("");
    }
  };

  return (
    <AppShell title="AI Reviews" subtitle="Structured deployment readiness reports across releases">
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <div className="grid gap-4">
          {reviews.map((review) => {
            const release = review.releaseId as Release;
            return (
              <Card key={review._id}>
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle>{release?.title || "Release"} <span className="text-app-muted">{release?.version}</span></CardTitle>
                    <p className="mt-1 text-sm text-app-muted">{review.provider} / {review.model} / {formatDate(review.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="border-app-cyan/30 bg-app-cyan/10 text-app-cyan">{review.provider}</Badge>
                    {release?.riskLevel && <RiskBadge level={release.riskLevel} />}
                    <Button variant="secondary" disabled={busy === release?._id} onClick={() => regenerate(release._id)}><RefreshCw className="h-4 w-4" />Regenerate</Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-5 lg:grid-cols-[auto_1fr]">
                  {release?.riskLevel && <div className="flex justify-center"><RiskMeter score={release.riskScore} level={release.riskLevel} size="md" /></div>}
                  <div className="grid gap-4 text-sm leading-6 text-app-muted md:grid-cols-2">
                    <p className="rounded-lg border border-app-border bg-app-panel/70 p-4"><span className="font-semibold text-app-text">Summary:</span> {review.summary}</p>
                    <p className="rounded-lg border border-app-border bg-app-panel/70 p-4"><span className="font-semibold text-app-text">Recommendation:</span> {review.rollbackRecommendation}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
