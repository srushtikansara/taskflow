"use client";
import { useMemo } from "react";
import { useDashboardStats } from "@/hooks/useTasks";
import { priorityConfig, statusConfig, formatDate } from "@/lib/utils";
import { Task, Priority, TaskStatus } from "@/types";
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, BarChart3, Target } from "lucide-react";

export default function AnalyticsPage() {
  const { tasks, stats, isLoading } = useDashboardStats();

  const completionRate = stats.total > 0
    ? Math.round((stats.done / stats.total) * 100)
    : 0;

  // Tasks by priority
  const byPriority = useMemo(() => {
    const counts: Record<Priority, number> = { low: 0, medium: 0, high: 0, urgent: 0 };
    tasks.forEach((t) => { counts[t.priority]++; });
    return counts;
  }, [tasks]);

  // Tasks by status
  const byStatus = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      todo: 0, in_progress: 0, review: 0, done: 0, cancelled: 0,
    };
    tasks.forEach((t) => { counts[t.status]++; });
    return counts;
  }, [tasks]);

  // Recently completed
  const recentlyDone = tasks
    .filter((t) => t.status === "done" && t.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 5);

  // Overdue tasks
  const overdue = tasks.filter((t) => {
    if (!t.due_date || t.status === "done" || t.status === "cancelled") return false;
    return new Date(t.due_date) < new Date();
  });

  // Completion by day (last 7 days)
  const weeklyData = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en", { weekday: "short" });
      const count = tasks.filter((t) => {
        if (!t.completed_at) return false;
        const cd = new Date(t.completed_at);
        return cd.toDateString() === d.toDateString();
      }).length;
      days.push({ label, count });
    }
    return days;
  }, [tasks]);

  const maxWeekly = Math.max(...weeklyData.map((d) => d.count), 1);

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Analytics
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Insights into your task performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-100">
        <KpiCard
          icon={<Target size={18} className="text-blue-600" />}
          bg="bg-blue-50 dark:bg-blue-900/20"
          label="Completion Rate"
          value={`${completionRate}%`}
          sub={`${stats.done} of ${stats.total} tasks`}
        />
        <KpiCard
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
          bg="bg-emerald-50 dark:bg-emerald-900/20"
          label="Completed"
          value={stats.done}
          sub="Total done"
        />
        <KpiCard
          icon={<Clock size={18} className="text-amber-600" />}
          bg="bg-amber-50 dark:bg-amber-900/20"
          label="In Progress"
          value={stats.in_progress}
          sub="Active tasks"
        />
        <KpiCard
          icon={<AlertTriangle size={18} className="text-rose-600" />}
          bg="bg-rose-50 dark:bg-rose-900/20"
          label="Overdue"
          value={overdue.length}
          sub="Need attention"
          alert={overdue.length > 0}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Completion rate ring */}
        <div className="card p-6 animate-fade-in-up delay-200">
          <h2 className="font-semibold mb-5 flex items-center gap-2"
              style={{ color: "var(--text)" }}>
            <TrendingUp size={16} className="text-blue-500" />
            Overall Completion
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none"
                        stroke="var(--surface-2)" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none"
                        stroke="#2563eb" strokeWidth="12"
                        strokeDasharray={`${completionRate * 2.51} 251`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 1s ease" }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                  {completionRate}%
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {Object.entries(byStatus).map(([status, count]) => {
                const sc = statusConfig[status as TaskStatus];
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-muted)" }}>{sc.label}</span>
                      <span className="font-medium" style={{ color: "var(--text)" }}>{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "var(--surface-2)" }}>
                      <div className={`h-full rounded-full ${sc.bg}`}
                           style={{ width: `${pct}%`, transition: "width 0.8s ease",
                                    background: status === "done" ? "#10b981" :
                                                status === "in_progress" ? "#3b82f6" :
                                                status === "review" ? "#8b5cf6" :
                                                status === "cancelled" ? "#94a3b8" : "#e2e8f0" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weekly completions bar chart */}
        <div className="card p-6 animate-fade-in-up delay-200">
          <h2 className="font-semibold mb-5 flex items-center gap-2"
              style={{ color: "var(--text)" }}>
            <BarChart3 size={16} className="text-blue-500" />
            Completions This Week
          </h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyData.map(({ label, count }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium" style={{ color: "var(--text)" }}>
                  {count > 0 ? count : ""}
                </span>
                <div className="w-full rounded-t-md transition-all duration-700"
                     style={{
                       height: `${(count / maxWeekly) * 96}px`,
                       minHeight: count > 0 ? "8px" : "4px",
                       background: count > 0
                         ? "linear-gradient(180deg, #3b82f6, #2563eb)"
                         : "var(--surface-2)",
                     }} />
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* By Priority */}
        <div className="card p-6 animate-fade-in-up delay-300">
          <h2 className="font-semibold mb-4" style={{ color: "var(--text)" }}>
            Tasks by Priority
          </h2>
          <div className="space-y-3">
            {(["urgent","high","medium","low"] as Priority[]).map((p) => {
              const cfg = priorityConfig[p];
              const count = byPriority[p];
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={p} className="flex items-center gap-3">
                  <span className={`w-20 text-xs font-semibold ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <div className="flex-1 h-2 rounded-full"
                       style={{ background: "var(--surface-2)" }}>
                    <div className={`h-full rounded-full ${cfg.dot}`}
                         style={{ width: `${pct}%`, transition: "width 0.8s ease",
                                  background: p === "urgent" ? "#f43f5e" :
                                              p === "high" ? "#f97316" :
                                              p === "medium" ? "#f59e0b" : "#10b981" }} />
                  </div>
                  <span className="w-8 text-xs text-right font-medium"
                        style={{ color: "var(--text)" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recently completed */}
        <div className="card p-6 animate-fade-in-up delay-300">
          <h2 className="font-semibold mb-4" style={{ color: "var(--text)" }}>
            Recently Completed
          </h2>
          {recentlyDone.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
              No completed tasks yet
            </p>
          ) : (
            <div className="space-y-2.5">
              {recentlyDone.map((task) => (
                <div key={task.id} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center
                                  justify-center flex-shrink-0">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate line-through opacity-60"
                       style={{ color: "var(--text)" }}>
                      {task.title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatDate(task.completed_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overdue tasks */}
      {overdue.length > 0 && (
        <div className="card p-6 border-rose-200 dark:border-rose-800 animate-fade-in-up delay-300">
          <h2 className="font-semibold mb-4 text-rose-600 flex items-center gap-2">
            <AlertTriangle size={16} />
            Overdue Tasks ({overdue.length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {overdue.map((task) => (
              <a key={task.id} href={`/dashboard/tasks/${task.id}`}
                 className="flex items-center gap-3 p-3 rounded-lg
                            bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100
                            dark:hover:bg-rose-900/30 transition-colors">
                <span className={`w-2 h-2 rounded-full flex-shrink-0
                                  ${priorityConfig[task.priority].dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-rose-900 dark:text-rose-200 truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-rose-500">
                    Due {formatDate(task.due_date)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, bg, label, value, sub, alert }: {
  icon: React.ReactNode; bg: string; label: string;
  value: number | string; sub: string; alert?: boolean;
}) {
  return (
    <div className={`card p-4 ${alert ? "border-rose-200 dark:border-rose-800" : ""}`}>
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</div>
      <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--text)" }}>{label}</div>
      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="skeleton h-8 w-40" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="skeleton h-52 rounded-xl" />
        <div className="skeleton h-52 rounded-xl" />
      </div>
    </div>
  );
}
