"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, X, Save, Mail, Loader2, Eye, EyeOff, ChevronDown } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  notes: string;
  active: boolean;
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Client> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [resending, setResending] = useState<string | null>(null);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [clientAppointments, setClientAppointments] = useState<Record<string, Array<{id: string; service: string; date: string; time: string; status: string}>>>({});

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const url = search ? `/api/admin/clients?search=${encodeURIComponent(search)}` : "/api/admin/clients";
      const res = await fetch(url);
      if (res.ok) setClients(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [search]);

  useEffect(() => { loadClients(); }, [loadClients]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!editing?.name || !editing?.email) return;
    try {
      const method = isNew ? "POST" : "PUT";
      const url = isNew ? "/api/admin/clients" : `/api/admin/clients/${editing.id}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (res.ok) {
        showToast(isNew ? "Client created & setup email sent" : "Client updated");
        setEditing(null);
        setIsNew(false);
        loadClients();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save");
      }
    } catch {
      showToast("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Client deleted");
        setDeleteConfirm(null);
        loadClients();
      }
    } catch {
      showToast("Failed to delete");
    }
  };

  const handleResendEmail = async (id: string) => {
    setResending(id);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: "POST" });
      if (res.ok) {
        showToast("Setup email sent");
      } else {
        showToast("Failed to send email");
      }
    } catch {
      showToast("Failed to send email");
    }
    setResending(null);
  };

  const toggleExpand = async (id: string) => {
    if (expandedClient === id) {
      setExpandedClient(null);
      return;
    }
    setExpandedClient(id);
    if (!clientAppointments[id]) {
      try {
        const res = await fetch(`/api/admin/clients/${id}`);
        if (res.ok) {
          const data = await res.json();
          setClientAppointments((prev) => ({ ...prev, [id]: data.appointments || [] }));
        }
      } catch { /* ignore */ }
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "confirmed": return "bg-green-100 text-green-700";
      case "completed": return "bg-blue-100 text-blue-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{clients.length} total clients</p>
        </div>
        <button onClick={() => { setEditing({ name: "", email: "", phone: "", dateOfBirth: "", gender: "", address: "", notes: "", active: true }); setIsNew(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
      </div>

      {/* Client List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-500">No clients found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <div key={client.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {client.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-medium text-sm truncate">{client.name}</p>
                    <p className="text-gray-500 text-xs truncate">{client.email}</p>
                  </div>
                  {client.phone && <span className="text-gray-400 text-xs hidden sm:block">{client.phone}</span>}
                  {!client.active && (
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Inactive</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleResendEmail(client.id)} disabled={resending === client.id}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-primary" title="Resend setup email">
                    {resending === client.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  </button>
                  <button onClick={() => toggleExpand(client.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600" title="View appointments">
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedClient === client.id ? "rotate-180" : ""}`} />
                  </button>
                  <button onClick={() => { setEditing(client); setIsNew(false); }}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-primary" title="Edit">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(client.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded: show appointments */}
              {expandedClient === client.id && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Appointment History</p>
                  {(clientAppointments[client.id] || []).length === 0 ? (
                    <p className="text-gray-400 text-sm">No appointments found for this client</p>
                  ) : (
                    <div className="space-y-2">
                      {clientAppointments[client.id].map((apt) => (
                        <div key={apt.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                          <div>
                            <span className="text-gray-900 text-sm font-medium">{apt.service}</span>
                            <span className="text-gray-400 text-xs ml-2">{apt.date} {apt.time}</span>
                          </div>
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${statusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{isNew ? "Add Client" : "Edit Client"}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                <input type="text" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input type="email" value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input type="tel" value={editing.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                  <input type="date" value={editing.dateOfBirth || ""} onChange={(e) => setEditing({ ...editing, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                  <select value={editing.gender || ""} onChange={(e) => setEditing({ ...editing, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">—</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={editing.active === false ? "inactive" : "active"} 
                    onChange={(e) => setEditing({ ...editing, active: e.target.value === "active" })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <input type="text" value={editing.address || ""} onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea rows={2} value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
            </div>

            {isNew && (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                An email will be sent to the client with a link to set up their portal password.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setEditing(null); setIsNew(false); }}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={!editing.name || !editing.email}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" /> {isNew ? "Create & Send Email" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-gray-900 font-semibold">Delete Client?</h3>
            <p className="text-gray-500 text-sm">This will permanently delete the client and cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
