"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { tasksService } from "@/services/tasks.service";
import { Task } from "@/types";
import { formatDate, formatRelative, priorityConfig, statusConfig, isOverdue, getInitials } from "@/lib/utils";
import {
  ArrowLeft, Edit, Trash2, CheckCircle2, Clock, User, Tag,
  AlertTriangle, Loader2,
} from "lucide-react";
import TaskForm from "@/components/tasks/TaskForm";

export default function TaskDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const [task, setTask]   = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    tasksService.get(id)
      .then(setTask)
      .catch(() => { toast.error("Task not found"); router.push("/dashboard/tasks"); })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("Delete this task permanently?")) return;
    try {
      await tasksService.delete(id);
      toast.success("Task deleted");
      router.push("/dashboard/tasks");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleComplete = async () => {
    if (!task) return;
    setCompleting(true);
    try {
      const updated = await tasksService.updateStatus(id, "done");
      setTask(updated);
      toast.success("Task completed 🎉");
    } catch {
      toast.error("Failed to update task");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <TaskDetailSkeleton />;
  if (!task)   return null;

  const sc    = statusConfig[task.status];
  const pc    = priorityConfig[task.priority];
  const over  = isOverdue(task.due_date, task.status);
  const isDone = task.status === "done";

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setEditing(false)} className="btn-ghost p-2 -ml-2">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Edit Task</h1>
        </div>
        <div className="card p-6">
          <TaskForm task={task} onCancel={() => setEditing(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/tasks" className="btn-ghost p-2 -ml-2">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1" />
        {!isDone && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="btn-primary px-4 py-2 text-sm"
          >
            {completing
              ? <><Loader2 size={15} className="animate-spin" /> Updating…</>
              : <><CheckCircle2 size={15} /> Mark Complete</>
            }
          </button>
        )}
        <button
          onClick={() => setEditing(true)}
          className="btn-secondary px-4 py-2 text-sm"
        >
          <Edit size={15} /> Edit
        </button>
        <button
          onClick={handleDelete}
          className="btn-danger px-4 py-2 text-sm"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="card overflow-hidden">
        {/* Status bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${
          isDone      ? "from-emerald-400 to-emerald-600" :
          over        ? "from-rose-400 to-rose-600" :
          task.status === "in_progress" ? "from-blue-400 to-blue-600" :
          "from-slate-200 to-slate-300"
        }`} />

        <div className="p-6 lg:p-8">
          {/* Title & badges */}
          <div className="mb-5">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`badge ${sc.bg} ${sc.color}`}>{sc.icon} {sc.label}</span>
              <span className={`badge ${pc.bg} ${pc.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
                {pc.label}
              </span>
              {over && (
                <span className="badge bg-rose-50 text-rose-600 border-rose-200">
                  <AlertTriangle size={11} /> Overdue
                </span>
              )}
            </div>
            <h1 className={`text-2xl font-bold text-slate-900 ${isDone ? "line-through text-slate-400" : ""}`}>
              {task.title}
            </h1>
          </div>

          {/* Description */}
          {task.description && (
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Meta grid */}
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {task.due_date && (
              <MetaItem
                icon={<Clock size={14} className={over ? "text-rose-500" : "text-slate-400"} />}
                label="Due Date"
                value={
                  <span className={over ? "text-rose-600 font-medium" : ""}>
                    {formatDate(task.due_date)}
                  </span>
                }
              />
            )}
            {task.assignee && (
              <MetaItem
                icon={<User size={14} className="text-slate-400" />}
                label="Assigned to"
                value={
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                                     text-white text-[10px] font-bold flex items-center justify-center">
                      {getInitials(task.assignee.full_name)}
                    </span>
                    {task.assignee.full_name}
                  </div>
                }
              />
            )}
            {task.creator && (
              <MetaItem
                icon={<User size={14} className="text-slate-400" />}
                label="Created by"
                value={task.creator.full_name}
              />
            )}
            {task.tags.length > 0 && (
              <MetaItem
                icon={<Tag size={14} className="text-slate-400" />}
                label="Tags"
                value={
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600
                                               rounded text-xs">{t}</span>
                    ))}
                  </div>
                }
              />
            )}
          </div>

          {/* Timestamps */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-400">
            <span>Created {formatRelative(task.created_at)}</span>
            <span>Updated {formatRelative(task.updated_at)}</span>
            {task.completed_at && (
              <span className="text-emerald-500">
                ✓ Completed {formatRelative(task.completed_at)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaItem({
  icon, label, value,
}: {
  icon: React.ReactNode; label: string; value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-400 flex items-center gap-1.5">
        {icon}{label}
      </span>
      <div className="text-sm text-slate-700">{value}</div>
    </div>
  );
}

function TaskDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="skeleton h-8 w-40" />
      <div className="card p-8 space-y-4">
        <div className="skeleton h-7 w-3/4" />
        <div className="skeleton h-20 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-10 rounded-lg" />
          <div className="skeleton h-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
