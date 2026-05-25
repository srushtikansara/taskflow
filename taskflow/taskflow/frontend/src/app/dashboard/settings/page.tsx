"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import { User, Bell, Shield, LogOut, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);

  const handleSave = () => {
    toast.success("Settings saved!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your account preferences
        </p>
      </div>

      {/* Profile card */}
      <div className="card p-6 animate-fade-in-up delay-100">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} className="text-slate-500" />
          <h2 className="font-semibold text-slate-900">Profile</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                          flex items-center justify-center text-white font-bold text-lg
                          flex-shrink-0 overflow-hidden">
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={user.full_name}
                   className="w-full h-full object-cover" />
            ) : (
              getInitials(user?.full_name ?? "")
            )}
          </div>

          {/* Details */}
          <div>
            <p className="font-semibold text-slate-900 text-lg">{user?.full_name}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <span className="badge bg-blue-50 text-blue-700 border-blue-200 text-xs mt-1">
              {user?.role === "admin" ? "Admin" : "Member"}
            </span>
          </div>
        </div>

        <div className="mt-5 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <Shield size={13} className="text-emerald-500" />
            Your account is secured with Google OAuth. Profile details are
            managed through your Google account.
          </p>
        </div>
      </div>

      {/* Notifications card */}
      <div className="card p-6 animate-fade-in-up delay-200">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={16} className="text-slate-500" />
          <h2 className="font-semibold text-slate-900">Notifications</h2>
        </div>

        <div className="space-y-4">
          <Toggle
            label="Email notifications"
            description="Receive emails when tasks are assigned to you"
            checked={emailNotifs}
            onChange={setEmailNotifs}
          />
          <Toggle
            label="Task reminders"
            description="Get notified when tasks are due soon"
            checked={taskReminders}
            onChange={setTaskReminders}
          />
        </div>

        <button
          onClick={handleSave}
          className="btn-primary px-4 py-2 text-sm mt-5"
        >
          <Check size={15} /> Save Preferences
        </button>
      </div>

      {/* Account card */}
      <div className="card p-6 animate-fade-in-up delay-300">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={16} className="text-slate-500" />
          <h2 className="font-semibold text-slate-900">Account</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50
                          border border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">Sign out</p>
              <p className="text-xs text-slate-400">Sign out of your account on this device</p>
            </div>
            <button
              onClick={logout}
              className="btn-secondary px-3 py-1.5 text-sm text-red-500
                         hover:bg-red-50 hover:border-red-200"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label, description, checked, onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200
                    ${checked ? "bg-blue-600" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                          shadow-sm transition-transform duration-200
                          ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}