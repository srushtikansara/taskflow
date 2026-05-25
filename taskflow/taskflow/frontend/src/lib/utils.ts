import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { Priority, TaskStatus } from "@/types";

// ── Tailwind class merger ──────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date helpers ───────────────────────────────────────────────────────────
export function formatDate(date: string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d, yyyy");
}

export function formatRelative(date: string | null | undefined): string {
  if (!date) return "Unknown";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isOverdue(dueDate: string | null, status: TaskStatus): boolean {
  if (!dueDate || status === "done" || status === "cancelled") return false;
  return isPast(new Date(dueDate));
}

// ── Priority config ────────────────────────────────────────────────────────
export const priorityConfig: Record<
  Priority,
  { label: string; color: string; bg: string; dot: string }
> = {
  low:    { label: "Low",    color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  medium: { label: "Medium", color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",     dot: "bg-amber-500"   },
  high:   { label: "High",   color: "text-orange-700",  bg: "bg-orange-50 border-orange-200",   dot: "bg-orange-500"  },
  urgent: { label: "Urgent", color: "text-rose-700",    bg: "bg-rose-50 border-rose-200",       dot: "bg-rose-500"    },
};

// ── Status config ──────────────────────────────────────────────────────────
export const statusConfig: Record<
  TaskStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  todo:        { label: "To Do",       color: "text-slate-600",  bg: "bg-slate-100",   icon: "○" },
  in_progress: { label: "In Progress", color: "text-blue-700",   bg: "bg-blue-50",     icon: "◑" },
  review:      { label: "In Review",   color: "text-purple-700", bg: "bg-purple-50",   icon: "◎" },
  done:        { label: "Done",        color: "text-emerald-700",bg: "bg-emerald-50",  icon: "●" },
  cancelled:   { label: "Cancelled",   color: "text-slate-400",  bg: "bg-slate-50",    icon: "✕" },
};

// ── Truncate ───────────────────────────────────────────────────────────────
export function truncate(str: string, len = 60): string {
  return str.length <= len ? str : str.slice(0, len) + "…";
}

// ── Initials ───────────────────────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
