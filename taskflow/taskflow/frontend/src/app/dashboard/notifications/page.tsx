"use client";
import { useNotifications } from "@/hooks/useTasks";
import { formatRelative } from "@/lib/utils";
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Notification } from "@/types";
import { notificationsService } from "@/services/users.service";
import toast from "react-hot-toast";

const TYPE_CONFIG = {
  task_assigned:  { icon: "📌", color: "bg-blue-50 border-blue-100" },
  task_completed: { icon: "✅", color: "bg-emerald-50 border-emerald-100" },
  task_due_soon:  { icon: "⏰", color: "bg-amber-50 border-amber-100" },
  task_overdue:   { icon: "⚠️", color: "bg-rose-50 border-rose-100" },
  mention:        { icon: "💬", color: "bg-purple-50 border-purple-100" },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markRead, markAllRead, reload } = useNotifications();

  const handleDelete = async (id: string) => {
    try {
      await notificationsService.delete(id);
      reload();
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-500 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="btn-secondary px-3 py-2 text-sm gap-2"
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      <div className="card overflow-hidden animate-fade-in-up delay-100">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-48 rounded" />
                  <div className="skeleton h-3 w-64 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <NotifRow
                key={n.id}
                notification={n}
                onRead={markRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotifRow({
  notification: n,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[n.type];
  return (
    <div
      className={`flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors group
                  ${!n.is_read ? "bg-blue-50/30" : ""}`}
    >
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center
                       text-xl flex-shrink-0 ${cfg.color}`}>
        {cfg.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${n.is_read ? "text-slate-600" : "text-slate-900"}`}>
          {n.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
        <p className="text-[11px] text-slate-400 mt-1">{formatRelative(n.created_at)}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!n.is_read && (
          <button
            onClick={() => onRead(n.id)}
            title="Mark as read"
            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Check size={14} />
          </button>
        )}
        {n.task_id && (
          <Link
            href={`/dashboard/tasks/${n.task_id}`}
            title="View task"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ExternalLink size={14} />
          </Link>
        )}
        <button
          onClick={() => onDelete(n.id)}
          title="Delete"
          className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
