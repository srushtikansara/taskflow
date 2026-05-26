"use client";
import { useAuth } from "@/lib/auth-context";
import { useDashboardStats } from "@/hooks/useTasks";
import { getInitials, formatRelative, formatDate } from "@/lib/utils";
import { Mail, Shield, Calendar, CheckCircle2, Clock, Target, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { stats, isLoading } = useDashboardStats();

  if (!user) return null;

  const completionRate = stats.total > 0
    ? Math.round((stats.done / stats.total) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Your account details and statistics
        </p>
      </div>

      {/* Profile hero card */}
      <div className="card overflow-hidden animate-fade-in-up delay-100">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-br from-blue-500 via-blue-600 to-violet-600
                        relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <div key={i}
                   className="absolute rounded-full bg-white"
                   style={{
                     width: Math.random() * 80 + 20,
                     height: Math.random() * 80 + 20,
                     left: `${Math.random() * 100}%`,
                     top:  `${Math.random() * 100}%`,
                     opacity: Math.random() * 0.3,
                   }} />
            ))}
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700
                            flex items-center justify-center text-white text-2xl font-bold
                            border-4 overflow-hidden shadow-lg flex-shrink-0"
                 style={{ borderColor: "var(--surface)" }}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt={user.full_name}
                       className="w-full h-full object-cover" />
                : getInitials(user.full_name)
              }
            </div>
            <span className="badge bg-blue-50 dark:bg-blue-900/30 text-blue-700
                             dark:text-blue-400 border-blue-200 dark:border-blue-800">
              <Shield size={11} /> {user.role === "admin" ? "Admin" : "Member"}
            </span>
          </div>

          {/* Name & email */}
          <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
            {user.full_name}
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <Mail size={13} style={{ color: "var(--text-muted)" }} />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {user.email}
            </span>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4"
               style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-center gap-1.5 text-xs"
                 style={{ color: "var(--text-muted)" }}>
              <Calendar size={12} />
              Joined {formatRelative(user.created_at)}
            </div>
            {user.last_login && (
              <div className="flex items-center gap-1.5 text-xs"
                   style={{ color: "var(--text-muted)" }}>
                <Clock size={12} />
                Last login {formatRelative(user.last_login)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up delay-200">
        {[
          { label: "Total Tasks",  value: stats.total,       icon: "📋", color: "text-blue-600" },
          { label: "Completed",    value: stats.done,        icon: "✅", color: "text-emerald-600" },
          { label: "In Progress",  value: stats.in_progress, icon: "⏳", color: "text-amber-600" },
          { label: "Completion",   value: `${completionRate}%`, icon: "🎯", color: "text-violet-600" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Completion progress */}
      <div className="card p-6 animate-fade-in-up delay-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2"
              style={{ color: "var(--text)" }}>
            <Target size={16} className="text-blue-500" />
            Task Completion Rate
          </h3>
          <span className="text-lg font-bold text-blue-600">{completionRate}%</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden"
             style={{ background: "var(--surface-2)" }}>
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600
                          transition-all duration-1000"
               style={{ width: `${completionRate}%` }} />
        </div>
        <div className="flex justify-between text-xs mt-2"
             style={{ color: "var(--text-muted)" }}>
          <span>0%</span>
          <span>{stats.done} of {stats.total} tasks completed</span>
          <span>100%</span>
        </div>
      </div>

      {/* Account info */}
      <div className="card p-6 animate-fade-in-up delay-300">
        <h3 className="font-semibold mb-4" style={{ color: "var(--text)" }}>
          Account Information
        </h3>
        <div className="space-y-4">
          {[
            { label: "Full Name",   value: user.full_name },
            { label: "Email",       value: user.email },
            { label: "Role",        value: user.role === "admin" ? "Administrator" : "Member" },
            { label: "Auth Method", value: "Google OAuth 2.0" },
            { label: "Member Since",value: formatDate(user.created_at) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b last:border-0"
                 style={{ borderColor: "var(--border)" }}>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
              <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg flex items-start gap-3"
             style={{ background: "var(--surface-2)" }}>
          <Shield size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Your profile is managed through Google. To update your name or
            photo, visit your Google Account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
