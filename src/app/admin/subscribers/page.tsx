"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  UserPlus,
  Mail,
  Trash2,
  X,
} from "lucide-react";
import { type Subscriber } from "@/data/admin";

function createBlankSubscriber(): Subscriber {
  return {
    id: Date.now().toString(),
    email: "",
    name: "",
    subscribedAt: new Date().toISOString().split("T")[0],
    status: "active",
    source: "manual",
  };
}

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Subscriber | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/subscribers");
      if (res.ok) setSubscribers(await res.json());
    } catch { /* API unavailable */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = () => {
    setEditing(createBlankSubscriber());
    setIsNew(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.email.trim() || !editing.name.trim()) {
      showToast("Name and email are required.");
      return;
    }
    try {
      if (isNew) {
        if (subscribers.some((s) => s.email.toLowerCase() === editing.email.toLowerCase())) {
          showToast("A subscriber with this email already exists.");
          return;
        }
        const res = await fetch("/api/admin/subscribers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
        const created = await res.json();
        setSubscribers((prev) => [{ ...editing, id: created.id }, ...prev]);
        showToast("Subscriber added");
      } else {
        await fetch(`/api/admin/subscribers/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
        setSubscribers((prev) => prev.map((s) => (s.id === editing.id ? editing : s)));
        showToast("Subscriber updated");
      }
    } catch {
      showToast("Failed to save subscriber");
    }
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/subscribers/${id}`, { method: "DELETE" });
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirm(null);
      showToast("Subscriber removed");
    } catch {
      showToast("Failed to delete subscriber");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Status", "Subscribed", "Source"];
    const rows = subscribers.map((s) => [s.name, s.email, s.status, s.subscribedAt, s.source]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "haven-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported");
  };

  const filtered = subscribers.filter((sub) => {
    const matchSearch =
      search === "" ||
      sub.email.toLowerCase().includes(search.toLowerCase()) ||
      sub.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || sub.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = subscribers.filter((s) => s.status === "active").length;
  const unsubscribedCount = subscribers.filter((s) => s.status === "unsubscribed").length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-100 bg-dark text-white px-5 py-3 rounded-xl shadow-lg text-sm animate-fade-in">
          {toast}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-90 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Remove Subscriber?</h3>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-80 bg-black/40 flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{isNew ? "Add Subscriber" : "Edit Subscriber"}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as Subscriber["status"] })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  <option value="active">Active</option>
                  <option value="unsubscribed">Unsubscribed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value as Subscriber["source"] })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  <option value="manual">Manual</option>
                  <option value="footer">Footer</option>
                  <option value="popup">Popup</option>
                  <option value="blog">Blog</option>
                  <option value="appointment">Appointment</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark font-medium">
                {isNew ? "Add" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your newsletter subscriber list.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
            <UserPlus className="w-4 h-4" />
            Add Subscriber
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total Subscribers</p>
          <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Unsubscribed</p>
          <p className="text-2xl font-bold text-red-500">{unsubscribedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "unsubscribed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Subscriber</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed On</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{sub.name}</p>
                        <p className="text-xs text-gray-500">{sub.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                      sub.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>{sub.status}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{sub.subscribedAt}</td>
                  <td className="px-5 py-4 text-gray-600 capitalize">{sub.source}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditing(sub); setIsNew(false); }} className="px-3 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Edit</button>
                      <button onClick={() => setDeleteConfirm(sub.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                    No subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
