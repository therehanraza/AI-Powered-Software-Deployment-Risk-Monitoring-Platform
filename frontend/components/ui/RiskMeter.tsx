import { riskTone } from "@/lib/utils";
import type { RiskLevel } from "@/types";

export function RiskMeter({ score, level, size = "md" }: { score: number; level: RiskLevel; size?: "sm" | "md" | "lg" }) {
  const radius = size === "lg" ? 58 : size === "sm" ? 34 : 46;
  const stroke = size === "lg" ? 11 : size === "sm" ? 8 : 10;
  const normalized = radius - stroke / 2;
  const circumference = normalized * 2 * Math.PI;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const dimension = radius * 2;
  const color = riskTone(score);
  const textSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: dimension, height: dimension }}>
      <svg width={dimension} height={dimension} className="-rotate-90">
        <circle cx={radius} cy={radius} r={normalized} stroke="#1E293B" strokeWidth={stroke} fill="transparent" />
        <circle
          cx={radius}
          cy={radius}
          r={normalized}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <p className={`${textSize} font-semibold leading-none`} style={{ color }}>{score}</p>
        {size !== "sm" && <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-app-muted">{level}</p>}
      </div>
    </div>
  );
}

export function RiskBar({ score }: { score: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-app-panel">
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, score))}%`, backgroundColor: riskTone(score) }} />
    </div>
  );
}
