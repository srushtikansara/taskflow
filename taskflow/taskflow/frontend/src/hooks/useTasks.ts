"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { tasksService } from "@/services/tasks.service";
import { notificationsService } from "@/services/users.service";
import { Task, TaskFilters, DashboardStats, Notification } from "@/types";

// ── useTasks ──────────────────────────────────────────────────────────────
export function useTasks(filters?: TaskFilters) {
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tasksService.list(filters);
      setTasks(res.tasks);
    } catch {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  return { tasks, isLoading, error, reload: load, setTasks };
}

// ── useDashboardStats ─────────────────────────────────────────────────────
export function useDashboardStats() {
  const { tasks, isLoading } = useTasks();

  const stats: DashboardStats = {
    total:       tasks.length,
    todo:        tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done:        tasks.filter((t) => t.status === "done").length,
    overdue:     tasks.filter((t) => {
      if (!t.due_date || t.status === "done" || t.status === "cancelled") return false;
      return new Date(t.due_date) < new Date();
    }).length,
  };

  return { stats, tasks, isLoading };
}

// ── useNotifications ──────────────────────────────────────────────────────
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [isLoading, setLoading]           = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await notificationsService.list();
      setNotifications(res.notifications);
      setUnreadCount(res.unread_count);
    } catch {
      // silent – non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000); // poll every 30 s
    return () => clearInterval(interval);
  }, [load]);

  const markRead = async (id: string) => {
    await notificationsService.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await notificationsService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    toast.success("All notifications marked as read");
  };

  return { notifications, unreadCount, isLoading, markRead, markAllRead, reload: load };
}

// ── useTaskMutations ──────────────────────────────────────────────────────
export function useTaskMutations(onSuccess?: () => void) {
  const [isMutating, setMutating] = useState(false);

  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    setMutating(true);
    try {
      await tasksService.delete(id);
      toast.success("Task deleted");
      onSuccess?.();
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setMutating(false);
    }
  };

  const completeTask = async (id: string) => {
    setMutating(true);
    try {
      await tasksService.updateStatus(id, "done");
      toast.success("Task marked as complete 🎉");
      onSuccess?.();
    } catch {
      toast.error("Failed to update task");
    } finally {
      setMutating(false);
    }
  };

  return { isMutating, deleteTask, completeTask };
}
