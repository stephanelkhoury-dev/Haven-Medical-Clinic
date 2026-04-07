"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../layout";
import { Plus, Pencil, Trash2, X, Save, Shield, Loader2, Eye, EyeOff } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
}

const roles = [
  { value: "admin", label: "Admin", desc: "Full access — manage users, settings, and everything" },
  { value: "finance", label: "Finance", desc: "Accounting, subscriptions, expenses" },
  { value: "editor", label: "Editor", desc: "Blog, services, doctors, testimonials" },
  { value: "front_desk", label: "Front Desk", desc: "Appointments, subscribers, newsletter" },
];

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/20 text-red-400",
  finance: "bg-green-500/20 text-green-400",
  editor: "bg-blue-500/20 text-blue-400",
  front_desk: "bg-amber-500/20 text-amber-400",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  finance: "Finance",
  editor: "Editor",
  front_desk: "Front Desk",
};

export default function UsersPage() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(Partial<AdminUser> & { password?: string }) | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "x-auth-token": token || "" },
      });
      if (res.ok) setUsers(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!editing) return;

    if (isNew && (!editing.username || !editing.password || !editing.name || !editing.role)) {
      showToast("Please fill in all fields");
      return;
    }

    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/admin/users" : `/api/admin/users/${editing.id}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-auth-token": token || "" },
        body: JSON.stringify(editing),
      });

      if (res.ok) {
        showToast(isNew ? "User created" : "User updated");
        setEditing(null);
        setIsNew(false);
        setShowPassword(false);
        loadData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to save");
      }
    } catch {
      showToast("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token || "" },
      });
      if (res.ok) {
        showToast("User deleted");
        setDeleteConfirm(null);
        loadData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete");
      }
    } catch {
      showToast("Failed to delete");
    }
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">Admin access required</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-accent text-white px-4 py-2 rounded-lg shadow-lg text-sm">{toast}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-white/60 text-sm mt-1">Create accounts and assign roles</p>
        </div>
        <button
          onClick={() => {
            setEditing({ username: "", password: "", name: "", role: "front_desk", active: true });
            setIsNew(true);
            setShowPassword(false);
          }}
          className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Role Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {roles.map((r) => (
          <div key={r.value} className="bg-card border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${ROLE_COLORS[r.value]}`}>
                {r.label}
              </span>
            </div>
            <p className="text-white/50 text-xs mt-1">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-card border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-white/60 text-xs uppercase tracking-wider px-5 py-3">User</th>
              <th className="text-left text-white/60 text-xs uppercase tracking-wider px-5 py-3">Username</th>
              <th className="text-left text-white/60 text-xs uppercase tracking-wider px-5 py-3">Role</th>
              <th className="text-left text-white/60 text-xs uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-white/60 text-xs uppercase tracking-wider px-5 py-3">Created</th>
              <th className="text-right text-white/60 text-xs uppercase tracking-wider px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={`border-b border-white/5 hover:bg-white/5 ${!u.active ? 'opacity-50' : ''}`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-accent">
                        {u.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <span className="text-white font-medium text-sm">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-white/60 text-sm">{u.username}</td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${u.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/40 text-sm">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => { setEditing({ ...u, password: "" }); setIsNew(false); setShowPassword(false); }}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-white/40" />
                    </button>
                    {u.id !== currentUser?.id && (
                      <button onClick={() => setDeleteConfirm(u.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-400/40" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-white font-semibold mb-2">Delete User?</h3>
            <p className="text-white/60 text-sm mb-4">This will remove their account and end all active sessions. This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-white/60 hover:text-white text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-white/10 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">{isNew ? "Create User" : "Edit User"}</h3>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider mb-1 block">Full Name</label>
                <input type="text" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="e.g. Dr. Nacouzi"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent" />
              </div>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider mb-1 block">Username</label>
                <input type="text" value={editing.username || ""} onChange={(e) => setEditing({ ...editing, username: e.target.value })}
                  placeholder="e.g. nacouzi" disabled={!isNew}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent disabled:opacity-50" />
              </div>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider mb-1 block">
                  {isNew ? "Password" : "New Password (leave blank to keep current)"}
                </label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={editing.password || ""}
                    onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                    placeholder={isNew ? "Enter password" : "Leave blank to keep current"}
                    required={isNew}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-10 text-white text-sm focus:outline-none focus:border-accent" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => (
                    <button key={r.value} type="button"
                      onClick={() => setEditing({ ...editing, role: r.value })}
                      className={`text-left p-3 rounded-lg border transition-colors ${editing.role === r.value ? 'border-accent bg-accent/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${ROLE_COLORS[r.value]}`}>
                        {r.label}
                      </span>
                      <p className="text-white/40 text-[10px] mt-1.5 leading-tight">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {!isNew && (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                    <input type="checkbox" checked={editing.active !== false}
                      onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                      className="accent-accent" />
                    Active
                  </label>
                  <span className="text-white/30 text-xs">— Inactive users cannot log in</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-white/60 hover:text-white text-sm">Cancel</button>
              <button onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm transition-colors">
                <Save className="w-4 h-4" />
                {isNew ? "Create User" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
