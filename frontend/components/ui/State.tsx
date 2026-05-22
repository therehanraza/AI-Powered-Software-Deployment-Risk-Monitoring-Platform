import { AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export function LoadingState({ label = "Loading workspace..." }: { label?: string }) {
  return <div className="flex min-h-64 items-center justify-center gap-3 text-app-muted"><Loader2 className="h-5 w-5 animate-spin" />{label}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 text-app-medium">
        <AlertTriangle className="h-5 w-5" />
        <span>{message}</span>
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-lg border border-dashed border-app-border p-8 text-center"><p className="font-semibold">{title}</p><p className="mt-2 text-sm text-app-muted">{description}</p></div>;
}
