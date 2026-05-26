"use client";
import { useState, useCallback } from "react";
import { useTasks } from "@/hooks/useTasks";
import { tasksService } from "@/services/tasks.service";
import { Task, TaskStatus } from "@/types";
import { priorityConfig, truncate, getInitials, formatDate, isOverdue } from "@/lib/utils";
import { Plus, MoreHorizontal, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const COLUMNS: { status: TaskStatus; label: string; color: string; bg: string }[] = [
  { status: "todo",        label: "To Do",       color: "text-slate-600",  bg: "bg-slate-100 dark:bg-slate-800" },
  { status: "in_progress", label: "In Progress", color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20" },
  { status: "review",      label: "In Review",   color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  { status: "done",        label: "Done",        color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-900/20" },
];

export default function KanbanPage() {
  const { tasks, isLoading, reload } = useTasks();
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver]  = useState<TaskStatus | null>(null);
  const [updating, setUpdating]  = useState<string | null>(null);

  const getByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status && !t.is_archived);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDragging(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = useCallback(async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragging || dragging === null) return;

    const task = tasks.find((t) => t.id === dragging);
    if (!task || task.status === status) { setDragging(null); return; }

    setUpdating(dragging);
    setDragging(null);
    try {
      await tasksService.updateStatus(dragging, status);
      toast.success(`Moved to ${COLUMNS.find((c) => c.status === status)?.label}`);
      reload();
    } catch {
      toast.error("Failed to update task");
    } finally {
      setUpdating(null);
    }
  }, [dragging, tasks, reload]);

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOver(status);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            Kanban Board
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Drag and drop tasks to update their status
          </p>
        </div>
        <Link href="/dashboard/tasks/new" className="btn-primary px-4 py-2.5 text-sm">
          <Plus size={16} /> New Task
        </Link>
      </div>

      {/* Board */}
      {isLoading ? (
        <KanbanSkeleton />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {COLUMNS.map(({ status, label, color, bg }) => {
            const colTasks = getByStatus(status);
            const isOver   = dragOver === status;

            return (
              <div
                key={status}
                className="flex-shrink-0 w-72 flex flex-col"
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Column header */}
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3
                                 ${bg} border`}
                     style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${color}`}>{label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                                      bg-white/60 dark:bg-black/20 ${color}`}>
                      {colTasks.length}
                    </span>
                  </div>
                  <Link href="/dashboard/tasks/new"
                        className="p-1 rounded-lg hover:bg-white/60 dark:hover:bg-black/20
                                   transition-colors">
                    <Plus size={14} className={color} />
                  </Link>
                </div>

                {/* Drop zone */}
                <div className={`flex-1 flex flex-col gap-3 min-h-32 rounded-xl p-2
                                 transition-all duration-150
                                 ${isOver
                                   ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 ring-dashed"
                                   : "bg-transparent"
                                 }`}>
                  {colTasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      isUpdating={updating === task.id}
                      onDragStart={handleDragStart}
                      onDragEnd={() => setDragging(null)}
                    />
                  ))}

                  {colTasks.length === 0 && !isOver && (
                    <div className="flex-1 flex items-center justify-center py-8">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Drop tasks here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Kanban Card ────────────────────────────────────────────────────────────
function KanbanCard({
  task, isUpdating, onDragStart, onDragEnd,
}: {
  task: Task;
  isUpdating: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}) {
  const pc    = priorityConfig[task.priority];
  const over  = isOverdue(task.due_date, task.status);
  const isDone = task.status === "done";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={`card p-3 cursor-grab active:cursor-grabbing
                  hover:shadow-md transition-all duration-150 select-none
                  ${isUpdating ? "opacity-50" : ""}
                  ${isDone ? "opacity-70" : ""}`}
    >
      {isUpdating && (
        <div className="flex justify-center mb-2">
          <Loader2 size={14} className="animate-spin text-blue-500" />
        </div>
      )}

      {/* Priority badge */}
      <div className="flex items-center justify-between mb-2">
        <span className={`badge ${pc.bg} ${pc.color} text-[10px]`}>
          <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
          {pc.label}
        </span>
        <Link href={`/dashboard/tasks/${task.id}`}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700
                         transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal size={13} style={{ color: "var(--text-muted)" }} />
        </Link>
      </div>

      {/* Title */}
      <Link href={`/dashboard/tasks/${task.id}`}>
        <p className={`text-sm font-medium mb-2 hover:text-blue-500 transition-colors
                       leading-snug
                       ${isDone ? "line-through opacity-60" : ""}`}
           style={{ color: "var(--text)" }}>
          {truncate(task.title, 65)}
        </p>
      </Link>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag}
                  className="px-1.5 py-0.5 text-[10px] rounded"
                  style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2"
           style={{ borderTop: "1px solid var(--border)" }}>
        {task.due_date ? (
          <span className={`text-[11px] flex items-center gap-1
                            ${over ? "text-rose-500" : ""}`}
                style={!over ? { color: "var(--text-muted)" } : {}}>
            {over && <AlertTriangle size={10} />}
            {formatDate(task.due_date)}
          </span>
        ) : (
          <span />
        )}

        {task.assignee && (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                          flex items-center justify-center text-white text-[9px] font-bold
                          flex-shrink-0"
               title={task.assignee.full_name}>
            {getInitials(task.assignee.full_name)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function KanbanSkeleton() {
  return (
    <div className="flex gap-4">
      {[...Array(4)].map((_, col) => (
        <div key={col} className="flex-shrink-0 w-72">
          <div className="skeleton h-10 w-full rounded-xl mb-3" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
