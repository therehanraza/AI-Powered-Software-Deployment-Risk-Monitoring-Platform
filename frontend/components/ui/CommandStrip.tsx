import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CommandStrip({ items }: { items: { label: string; value: string | number; icon: LucideIcon; tone?: "blue" | "cyan" | "green" | "amber" | "red" }[] }) {
  const toneClass = {
    blue: "text-app-primary",
    cyan: "text-app-cyan",
    green: "text-app-safe",
    amber: "text-app-medium",
    red: "text-app-critical"
  };

  return (
    <div className="grid gap-3 rounded-lg border border-app-border bg-app-card/95 p-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-center gap-3 rounded-lg border border-app-border bg-app-panel/70 px-4 py-3">
            <Icon className={cn("h-5 w-5", toneClass[item.tone || "cyan"])} />
            <div>
              <p className="text-xs uppercase tracking-wider text-app-muted">{item.label}</p>
              <p className="mt-1 font-semibold text-app-text">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
