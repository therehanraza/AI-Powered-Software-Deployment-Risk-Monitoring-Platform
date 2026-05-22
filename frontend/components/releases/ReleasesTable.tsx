import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RiskBadge, StatusBadge } from "@/components/ui/Badge";
import { RiskBar } from "@/components/ui/RiskMeter";
import { formatDate } from "@/lib/utils";
import type { Release } from "@/types";

export function ReleasesTable({ releases }: { releases: Release[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-app-border">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-app-panel text-xs uppercase text-app-muted">
          <tr>
            <th className="px-4 py-3">Release</th>
            <th className="px-4 py-3">Environment</th>
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-app-border">
          {releases.map((release) => (
            <tr key={release._id} className="hover:bg-app-panel/50">
              <td className="px-4 py-4">
                <p className="font-medium">{release.title}</p>
                <p className="text-xs text-app-muted">{release.version} · {release.deploymentType}</p>
              </td>
              <td className="px-4 py-4 capitalize">{release.environment}</td>
              <td className="px-4 py-4">
                <div className="grid min-w-36 gap-2">
                  <div className="flex items-center justify-between gap-2"><span className="font-semibold">{release.riskScore}</span><RiskBadge level={release.riskLevel} /></div>
                  <RiskBar score={release.riskScore} />
                </div>
              </td>
              <td className="px-4 py-4"><StatusBadge status={release.status} /></td>
              <td className="px-4 py-4 text-app-muted">{formatDate(release.createdAt)}</td>
              <td className="px-4 py-4 text-right">
                <Link href={`/releases/${release._id}`}><Button variant="secondary"><Eye className="h-4 w-4" />View</Button></Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
