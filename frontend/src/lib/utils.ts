import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function confidenceToLabel(confidence: number): string {
  if (confidence >= 0.85) return "Very High";
  if (confidence >= 0.7) return "High";
  if (confidence >= 0.5) return "Moderate";
  if (confidence >= 0.3) return "Low";
  return "Very Low";
}

export function confidenceToColor(confidence: number): string {
  if (confidence >= 0.85) return "text-success";
  if (confidence >= 0.7) return "text-accent";
  if (confidence >= 0.5) return "text-warning";
  return "text-error";
}

export function riskToColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case "low": return "text-success bg-success/10";
    case "medium": return "text-warning bg-warning/10";
    case "high": return "text-error bg-error/10";
    case "critical": return "text-error bg-error/20 font-bold";
    default: return "text-text-secondary bg-card";
  }
}

export function statusToColor(status: string): string {
  switch (status.toLowerCase()) {
    case "completed": return "text-success bg-success/10";
    case "running": return "text-accent bg-accent/10 animate-pulse";
    case "pending": return "text-text-secondary bg-card";
    case "failed": return "text-error bg-error/10";
    case "cancelled": return "text-text-muted bg-card";
    default: return "text-text-secondary bg-card";
  }
}
