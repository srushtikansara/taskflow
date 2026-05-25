"use client";
import { useEffect, useState } from "react";
import { usersService } from "@/services/users.service";
import { User } from "@/types";
import { getInitials, formatRelative } from "@/lib/utils";
import { Users, Mail, Shield, Search } from "lucide-react";

export default function TeamPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [search, setSearch]   = useState("");
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    usersService.list()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Team</h1>
        <p className="text-slate-500 text-sm mt-1">
          All registered members of your workspace
        </p>
      </div>

      {/* Search */}
      <div className="card p-3 animate-fade-in-up delay-100">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Members count */}
      {!isLoading && (
        <p className="text-sm text-slate-500 animate-fade-in-up">
          {filtered.length} member{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Team grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up delay-200">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="skeleton w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="skeleton h-4 w-28 rounded" />
                  <div className="skeleton h-3 w-36 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-16 text-center">
            <Users size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No members found</p>
          </div>
        ) : (
          filtered.map((user) => (
            <MemberCard key={user.id} user={user} />
          ))
        )}
      </div>
    </div>
  );
}

function MemberCard({ user }: { user: User }) {
  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                        flex items-center justify-center text-white font-bold text-sm
                        flex-shrink-0 overflow-hidden">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
          ) : (
            getInitials(user.full_name)
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900 text-sm">{user.full_name}</p>
            {user.role === "admin" && (
              <span className="badge bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                <Shield size={9} /> Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Mail size={11} className="text-slate-400" />
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Joined {formatRelative(user.created_at)}
        </p>
      </div>
    </div>
  );
}