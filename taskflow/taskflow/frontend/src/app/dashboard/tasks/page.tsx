"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTasks, useTaskMutations } from "@/hooks/useTasks";
import { tasksService } from "@/services/tasks.service";
import { formatDate, isOverdue, priorityConfig, statusConfig, truncate, getInitials } from "@/lib/utils";
import { Task, TaskFilters, TaskStatus } from "@/types";
import {
  Plus, Search, Filter, Trash2, CheckCircle, Edit, ChevronDown,
  AlertTriangle, SlidersHorizontal,
} from "lucide-react";

const STATUS_OPTS: { value: TaskStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "In Review" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

const PRIORITY_OPTS = [
  { value: "", label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [search, setSearch]   = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const debouncedFilters: TaskFilters = {
    ...filters,
    search: search || undefined,
  };

  const { tasks, isLoading, reload } = useTasks(debouncedFilters);
  const { deleteTask, completeTask, isMutating } = useTaskMutations(reload);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    []
  );

  const clearFilters = () => {
    setFilters({});
    setSearch("");
  };

  const hasActiveFilters = search || filters.status || filters.priority;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isLoading ? "Loading…" : `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/dashboard/tasks/new" className="btn-primary px-4 py-2.5 text-sm self-start sm:self-auto">
          <Plus size={16} /> New Task
        </Link>
      </div>

      {/* ── Search + Filter bar ─────────────────────────────────── */}
      <div className="card p-3 flex flex-col sm:flex-row gap-2 animate-fade-in-up delay-100">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search tasks…"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary px-3 py-2 text-sm gap-2 ${showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : ""}`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          )}
          <ChevronDown size={13} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn-ghost px-3 py-2 text-sm text-rose-500 hover:bg-rose-50">
            Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 flex flex-wrap gap-3 animate-fade-in-up">
          <FilterSelect
            label="Status"
            value={filters.status ?? ""}
            options={STATUS_OPTS}
            onChange={(v) => setFilters((f) => ({ ...f, status: v as TaskStatus || undefined }))}
          />
          <FilterSelect
            label="Priority"
            value={filters.priority ?? ""}
            options={PRIORITY_OPTS}
            onChange={(v) => setFilters((f) => ({ ...f, priority: v as any || undefined }))}
          />
        </div>
      )}

      {/* ── Task list ───────────────────────────────────────────── */}
      <div className="card overflow-hidden animate-fade-in-up delay-200">
        {isLoading ? (
          <TaskListSkeleton />
        ) : tasks.length === 0 ? (
          <EmptyState hasFilters={!!hasActiveFilters} onClear={clearFilters} />
        ) : (
          <div className="divide-y divide-slate-50">
            {tasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                onDelete={deleteTask}
                onComplete={completeTask}
                disabled={isMutating}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Task list item ─────────────────────────────────────────────────────────
function TaskListItem({
  task, onDelete, onComplete, disabled,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  disabled: boolean;
}) {
  const sc     = statusConfig[task.status];
  const pc     = priorityConfig[task.priority];
  const over   = isOverdue(task.due_date, task.status);
  const isDone = task.status === "done";

  return (
    <div className="flex items-start sm:items-center gap-3 px-5 py-4 hover:bg-slate-50/80
                    transition-colors group">
      {/* Complete button */}
      <button
        onClick={() => !isDone && onComplete(task.id)}
        disabled={disabled || isDone}
        title={isDone ? "Completed" : "Mark complete"}
        className={`mt-0.5 sm:mt-0 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all
                    ${isDone
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                    } flex items-center justify-center`}
      >
        {isDone && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/tasks/${task.id}`}
            className={`text-sm font-medium hover:text-blue-600 transition-colors
                        ${isDone ? "line-through text-slate-400" : "text-slate-900"}`}
          >
            {task.title}
          </Link>
          <span className={`badge ${pc.bg} ${pc.color} text-[11px]`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
            {pc.label}
          </span>
          <span className={`badge ${sc.bg} ${sc.color} text-[11px]`}>
            {sc.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          {task.due_date && (
            <span className={`text-xs flex items-center gap-1 ${
              over ? "text-rose-500" : "text-slate-400"
            }`}>
              {over && <AlertTriangle size={11} />}
              {over ? "Overdue · " : "Due "}
              {formatDate(task.due_date)}
            </span>
          )}
          {task.assignee && (
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                               text-white text-[9px] font-bold flex items-center justify-center">
                {getInitials(task.assignee.full_name)}
              </span>
              {task.assignee.full_name}
            </span>
          )}
        </div>
      </div>

      {/* Actions (appear on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/dashboard/tasks/${task.id}/edit`}
          className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Edit"
        >
          <Edit size={15} />
        </Link>
        <button
          onClick={() => onDelete(task.id)}
          disabled={disabled}
          title="Delete"
          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function FilterSelect({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-slate-500">{label}:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input py-1.5 pr-8 text-sm w-auto"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="divide-y divide-slate-50">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="skeleton w-5 h-5 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-48 rounded" />
            <div className="skeleton h-3 w-32 rounded" />
          </div>
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="py-16 text-center">
      <div className="text-4xl mb-3">📋</div>
      <p className="font-medium text-slate-700 mb-1">
        {hasFilters ? "No tasks match your filters" : "No tasks yet"}
      </p>
      <p className="text-slate-400 text-sm mb-4">
        {hasFilters
          ? "Try adjusting your search or filters"
          : "Create your first task to get started"}
      </p>
      {hasFilters ? (
        <button onClick={onClear} className="btn-secondary px-4 py-2 text-sm">Clear filters</button>
      ) : (
        <Link href="/dashboard/tasks/new" className="btn-primary px-4 py-2 text-sm inline-flex">
          <Plus size={15} /> New Task
        </Link>
      )}
    </div>
  );
}
