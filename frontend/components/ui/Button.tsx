"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-app-primary text-white shadow-[0_10px_24px_rgba(59,130,246,0.22)] hover:bg-blue-500",
        variant === "secondary" && "border border-app-border bg-app-panel text-app-text hover:border-app-primary hover:bg-slate-800",
        variant === "danger" && "bg-app-critical text-white hover:bg-red-500",
        variant === "ghost" && "text-app-muted hover:bg-app-panel hover:text-app-text",
        className
      )}
      {...props}
    />
  );
}
