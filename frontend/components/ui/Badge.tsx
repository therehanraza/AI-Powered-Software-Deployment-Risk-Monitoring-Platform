import { cn, riskClasses, statusClasses } from "@/lib/utils";
import type { RiskLevel } from "@/types";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize", className)}>{children}</span>;
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <Badge className={riskClasses[level]}>{level}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={statusClasses[status] || statusClasses.draft}>{status.replaceAll("_", " ")}</Badge>;
}
