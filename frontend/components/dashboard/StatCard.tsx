import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export function StatCard({ label, value, icon: Icon, helper }: { label: string; value: string | number; icon: LucideIcon; helper?: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative flex items-start justify-between">
        <div className="absolute inset-x-0 top-0 h-1 bg-app-primary/80" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-app-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold leading-none">{value}</p>
          {helper && <p className="mt-2 text-xs text-app-muted">{helper}</p>}
        </div>
        <div className="rounded-lg border border-app-border bg-app-panel/80 p-3 text-app-cyan">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
