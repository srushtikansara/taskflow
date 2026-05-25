"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/hooks/useTasks";
import { getInitials } from "@/lib/utils";
import {
  LayoutDashboard, CheckSquare, Users, Bell, Settings,
  LogOut, Plus, Menu, X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/ui/ThemeToggle";

const NAV = [
  { href: "/dashboard",              icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/tasks",        icon: CheckSquare,     label: "My Tasks"  },
  { href: "/dashboard/tasks/new",    icon: Plus,            label: "New Task", accent: true },
  { href: "/dashboard/team",         icon: Users,           label: "Team"      },
  { href: "/dashboard/settings",     icon: Settings,        label: "Settings"  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const router   = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <DashboardSkeleton />;
  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────── */}
<aside
  className={`fixed lg:static inset-y-0 left-0 z-30 w-60 border-r
              flex flex-col shadow-sm transition-transform duration-200
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
  style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}
>
        {/* Logo */}
        {/* Logo */}
<div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100
                dark:border-slate-700">
  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700
                  flex items-center justify-center shadow-sm flex-shrink-0">
    <CheckSquare size={16} className="text-white" />
  </div>
  <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
    TaskFlow
  </span>
  <div className="ml-auto flex items-center gap-1">
    <ThemeToggle />
    <button
      className="ml-1 lg:hidden text-slate-400 hover:text-slate-600"
      onClick={() => setSidebarOpen(false)}
    >
      <X size={18} />
    </button>
  </div>
</div>
        
       

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label, accent }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${active ? "active" : ""} ${accent ? "mt-2" : ""}`}
              >
                <Icon size={17} className="flex-shrink-0" />
                <span>{label}</span>
                {accent && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
              </Link>
            );
          })}

          {/* Notifications */}
          <Link
            href="/dashboard/notifications"
            onClick={() => setSidebarOpen(false)}
            className={`nav-item ${pathname === "/dashboard/notifications" ? "active" : ""}`}
          >
            <Bell size={17} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold
                               px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </nav>

        {/* User footer */}
        <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={user?.full_name ?? ""} src={user?.avatar_url} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50
                         transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <button
            className="p-2 rounded-md text-slate-500 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-slate-900">TaskFlow</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// ── Avatar component ───────────────────────────────────────────────────────
function Avatar({
  name, src, size = "md",
}: {
  name: string; src?: string | null; size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-9 h-9 text-sm", lg: "w-10 h-10 text-sm" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                     flex items-center justify-center text-white font-semibold flex-shrink-0
                     overflow-hidden`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50">
      <div className="w-60 bg-white border-r border-slate-200 p-4 space-y-3">
        <div className="skeleton h-8 w-32 mb-6" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-9 w-full rounded-lg" />
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
