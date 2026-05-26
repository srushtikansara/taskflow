"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTasks, useNotifications } from "@/hooks/useTasks";
import { getInitials } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  LayoutDashboard, CheckSquare, Users, Bell, Settings,
  LogOut, Plus, Menu, X, KanbanSquare, Calendar,
  BarChart3, UserCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { tasks } = useTasks();
  const router   = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const todoCount       = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/auth/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <DashboardSkeleton />;
  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  const NAV_SECTIONS = [
    {
      label: "Main",
      items: [
        { href: "/dashboard",          icon: LayoutDashboard, label: "Dashboard" },
        {
          href: "/dashboard/tasks",    icon: CheckSquare,     label: "My Tasks",
          badge: todoCount + inProgressCount > 0 ? todoCount + inProgressCount : null,
        },
        { href: "/dashboard/kanban",   icon: KanbanSquare,    label: "Kanban Board" },
        { href: "/dashboard/calendar", icon: Calendar,        label: "Calendar" },
      ],
    },
    {
      label: "Insights",
      items: [
        { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
      ],
    },
    {
      label: "Team",
      items: [
        { href: "/dashboard/team", icon: Users, label: "Team Members" },
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-60 border-r
                    flex flex-col shadow-sm transition-transform duration-200
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}
      >

        {/* ── Logo header ── */}
<div
  className="flex items-center justify-between px-4 border-b flex-shrink-0"
  style={{ borderColor: "var(--border)", height: 64 }}
>
  {/* Logo takes full left space */}
  <img
    src="/logo.png"
    alt="TaskFlow"
    style={{
      height: 170,
      width: "auto",
      maxWidth: 160,
      objectFit: "contain",
      objectPosition: "left center",
      display: "block",
      flexShrink: 0,
    }}
  />

  {/* Theme toggle — small, right side */}
  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
    <div style={{ transform: "scale(0.85)", transformOrigin: "right center" }}>
      <ThemeToggle />
    </div>
    <button
      className="lg:hidden p-1 rounded-md transition-colors"
      style={{ color: "var(--text-muted)" }}
      onClick={() => setSidebarOpen(false)}
    >
      <X size={14} />
    </button>
  </div>
</div>

        {/* ── New Task button ── */}
        <div className="px-3 pt-3">
          <Link
            href="/dashboard/tasks/new"
            onClick={() => setSidebarOpen(false)}
            className="btn-primary w-full py-2 text-sm justify-center"
          >
            <Plus size={15} /> New Task
          </Link>
        </div>

        {/* ── Nav sections ── */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto mt-2">
          {NAV_SECTIONS.map(({ label, items }) => (
            <div key={label}>
              <p
                className="text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </p>
              <div className="space-y-0.5">
                {items.map(({ href, icon: Icon, label: itemLabel, badge }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`nav-item ${isActive(href) ? "active" : ""}`}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="flex-1">{itemLabel}</span>
                    {badge != null && badge > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold
                                       px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Account section */}
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Account
            </p>
            <div className="space-y-0.5">
              <Link
                href="/dashboard/notifications"
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive("/dashboard/notifications") ? "active" : ""}`}
              >
                <Bell size={16} className="flex-shrink-0" />
                <span className="flex-1">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold
                                   px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <Link
                href="/dashboard/profile"
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive("/dashboard/profile") ? "active" : ""}`}
              >
                <UserCircle size={16} className="flex-shrink-0" />
                <span>Profile</span>
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive("/dashboard/settings") ? "active" : ""}`}
              >
                <Settings size={16} className="flex-shrink-0" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* ── User footer ── */}
        <div
          className="p-3 border-t flex-shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                          flex items-center justify-center text-white text-xs font-bold
                          flex-shrink-0 overflow-hidden"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(user?.full_name ?? "")
              )}
            </div>

            {/* Name + email */}
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: "var(--text)" }}
              >
                {user?.full_name}
              </p>
              <p
                className="text-[10px] truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {user?.email}
              </p>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-md transition-colors flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 h-14 border-b flex-shrink-0"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <button
            className="p-2 rounded-md transition-colors"
            style={{ color: "var(--text-muted)" }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <img
            src="/logo.png"
            alt="TaskFlow"
            style={{ height: 36, width: "auto", objectFit: "contain" }}
          />

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <div
        className="w-60 border-r p-4 space-y-3 flex-shrink-0"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="skeleton h-10 w-36 mb-6" />
        <div className="skeleton h-9 w-full rounded-lg" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-8 w-full rounded-lg" />
        ))}
      </div>
      <div className="flex-1 p-6 space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    </div>
  );
}