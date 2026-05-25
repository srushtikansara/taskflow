"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useDashboardStats } from "@/hooks/useTasks";
import { formatDate, isOverdue, priorityConfig, statusConfig } from "@/lib/utils";
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Plus, ArrowRight, TrendingUp } from "lucide-react";
import { Task } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, tasks, isLoading } = useDashboardStats();

  const recentTasks   = tasks.slice(0, 5);
  const overdueTasks  = tasks.filter(
    (t) => isOverdue(t.due_date, t.status)
  ).slice(0, 3);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
    "Good evening";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          {greeting}, {user?.full_name?.split(" ")[0]} 👋
        </h1>
       <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Here's what's happening with your tasks today.
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-100">
        <StatCard
          label="Total Tasks"
          value={stats.total}
          icon={<ListTodo size={18} className="text-blue-600" />}
          bg="bg-blue-50"
          isLoading={isLoading}
        />
        <StatCard
          label="In Progress"
          value={stats.in_progress}
          icon={<Clock size={18} className="text-amber-600" />}
          bg="bg-amber-50"
          isLoading={isLoading}
        />
        <StatCard
          label="Completed"
          value={stats.done}
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
          bg="bg-emerald-50"
          isLoading={isLoading}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={<AlertTriangle size={18} className="text-rose-600" />}
          bg="bg-rose-50"
          isLoading={isLoading}
          highlight={stats.overdue > 0}
        />
      </div>

      {/* ── Progress bar ───────────────────────────────────────── */}
      {!isLoading && stats.total > 0 && (
        <div className="card p-5 animate-fade-in-up delay-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-slate-900">Overall Progress</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">
              {Math.round((stats.done / stats.total) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full
                         transition-all duration-700"
              style={{ width: `${(stats.done / stats.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {stats.done} of {stats.total} tasks completed
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* ── Recent tasks ─────────────────────────────────────── */}
        <div className="lg:col-span-2 card animate-fade-in-up delay-200">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Tasks</h2>
            <Link
              href="/dashboard/tasks"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-4 w-4 rounded-full" />
                  <div className="skeleton h-4 flex-1 rounded" />
                  <div className="skeleton h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="p-10 text-center">
              <ListTodo size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No tasks yet.</p>
              <Link href="/dashboard/tasks/new" className="btn-primary px-4 py-2 text-sm mt-3 inline-flex">
                Create your first task
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* ── Overdue tasks / quick actions ────────────────────── */}
        <div className="space-y-4 animate-fade-in-up delay-300">
          {/* Quick actions */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/tasks/new"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50
                           text-slate-700 hover:text-blue-700 transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center
                                group-hover:bg-blue-200 transition-colors">
                  <Plus size={15} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium">New Task</span>
              </Link>
              <Link
                href="/dashboard/tasks?status=in_progress"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-50
                           text-slate-700 hover:text-amber-700 transition-colors group"
              >
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center
                                group-hover:bg-amber-200 transition-colors">
                  <Clock size={15} className="text-amber-600" />
                </div>
                <span className="text-sm font-medium">In Progress</span>
              </Link>
            </div>
          </div>

          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <div className="card p-4 border-rose-100">
              <h3 className="text-sm font-semibold text-rose-700 mb-3 flex items-center gap-2">
                <AlertTriangle size={14} />
                Overdue Tasks
              </h3>
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/dashboard/tasks/${task.id}`}
                    className="block p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    <p className="text-sm font-medium text-rose-900 truncate">{task.title}</p>
                    <p className="text-xs text-rose-500 mt-0.5">
                      Due {formatDate(task.due_date)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon, bg, isLoading, highlight,
}: {
  label: string; value: number; icon: React.ReactNode;
  bg: string; isLoading: boolean; highlight?: boolean;
}) {
  return (
    <div className={`card p-5 ${highlight ? "border-rose-200" : ""}`}>
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      {isLoading ? (
        <div className="skeleton h-7 w-12 mb-1" />
      ) : (
        <div className="text-2xl font-bold text-slate-900">{value}</div>
      )}
      <div className="text-xs text-slate-500 font-medium">{label}</div>
    </div>
  );
}

// ── Task Row ───────────────────────────────────────────────────────────────
function TaskRow({ task }: { task: Task }) {
  const sc = statusConfig[task.status];
  const pc = priorityConfig[task.priority];
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <Link
      href={`/dashboard/tasks/${task.id}`}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
    >
      <span className="text-lg">{sc.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          task.status === "done" ? "line-through text-slate-400" : "text-slate-900"
        }`}>
          {task.title}
        </p>
        {task.due_date && (
          <p className={`text-xs mt-0.5 ${overdue ? "text-rose-500" : "text-slate-400"}`}>
            {overdue ? "⚠ " : ""}Due {formatDate(task.due_date)}
          </p>
        )}
      </div>
      <span className={`badge ${pc.bg} ${pc.color} hidden sm:inline-flex`}>
        <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
        {pc.label}
      </span>
    </Link>
  );
}
