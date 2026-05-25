"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { tasksService } from "@/services/tasks.service";
import { usersService } from "@/services/users.service";
import { Task, TaskFormData, User } from "@/types";
import { cn } from "@/lib/utils";
import { Loader2, Save, X, Calendar, Tag, User as UserIcon } from "lucide-react";

const schema = z.object({
  title:       z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  due_date:    z.string().optional(),
  priority:    z.enum(["low", "medium", "high", "urgent"]),
  status:      z.enum(["todo", "in_progress", "review", "done", "cancelled"]),
  assignee_id: z.string().optional(),
  tags:        z.string().optional(), // comma-separated
});

type FormValues = z.infer<typeof schema>;

interface TaskFormProps {
  task?: Task;      // if provided → edit mode
  onCancel?: () => void;
}

export default function TaskForm({ task, onCancel }: TaskFormProps) {
  const router  = useRouter();
  const isEdit  = !!task;
  const [users, setUsers] = useState<User[]>([]);

  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:       task?.title ?? "",
      description: task?.description ?? "",
      due_date:    task?.due_date ? task.due_date.slice(0, 16) : "",
      priority:    task?.priority ?? "medium",
      status:      task?.status   ?? "todo",
      assignee_id: task?.assignee_id ?? "",
      tags:        task?.tags?.join(", ") ?? "",
    },
  });

  useEffect(() => {
    usersService.list().then(setUsers).catch(() => {});
  }, []);

  const onSubmit = async (values: FormValues) => {
    const payload: TaskFormData = {
      title:       values.title,
      description: values.description,
      due_date:    values.due_date || undefined,
      priority:    values.priority,
      status:      values.status,
      assignee_id: values.assignee_id || undefined,
      tags:        values.tags
        ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };

    try {
      if (isEdit) {
        await tasksService.update(task!.id, payload);
        toast.success("Task updated!");
      } else {
        await tasksService.create(payload);
        toast.success("Task created!");
      }
      router.push("/dashboard/tasks");
      router.refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Something went wrong";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <Field label="Title" error={errors.title?.message} required>
        <input
          {...register("title")}
          className={cn("input", errors.title && "border-red-300 focus:ring-red-400")}
          placeholder="e.g. Design landing page hero section"
        />
      </Field>

      {/* Description */}
      <Field label="Description" error={errors.description?.message}>
        <textarea
          {...register("description")}
          rows={4}
          className="input resize-none"
          placeholder="Add more context about this task…"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Priority */}
        <Field label="Priority" error={errors.priority?.message}>
          <select {...register("priority")} className="input">
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🟠 High</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
        </Field>

        {/* Status */}
        <Field label="Status" error={errors.status?.message}>
          <select {...register("status")} className="input">
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </Field>

        {/* Due Date */}
        <Field label="Due Date" icon={<Calendar size={14} />}>
          <input
            type="datetime-local"
            {...register("due_date")}
            className="input"
          />
        </Field>

        {/* Assignee */}
        <Field label="Assign to" icon={<UserIcon size={14} />}>
          <select {...register("assignee_id")} className="input">
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name} ({u.email})
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Tags */}
      <Field label="Tags" icon={<Tag size={14} />} hint="Comma separated, e.g. design, frontend">
        <input
          {...register("tags")}
          className="input"
          placeholder="design, frontend, bug"
        />
      </Field>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary px-4 py-2 text-sm">
            <X size={15} /> Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary px-5 py-2.5 text-sm"
        >
          {isSubmitting ? (
            <><Loader2 size={15} className="animate-spin" /> Saving…</>
          ) : (
            <><Save size={15} /> {isEdit ? "Save Changes" : "Create Task"}</>
          )}
        </button>
      </div>
    </form>
  );
}

// ── Field wrapper ──────────────────────────────────────────────────────────
function Field({
  label, children, error, required, icon, hint,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {icon && <span className="inline-flex items-center gap-1.5">{icon}{label}</span>}
        {!icon && label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}
