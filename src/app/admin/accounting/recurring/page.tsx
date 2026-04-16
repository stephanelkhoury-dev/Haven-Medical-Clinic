"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../layout";
import { ArrowLeft, Plus, Trash2, X, Save, Loader2, RefreshCw, Play, Pause, Calendar } from "lucide-react";

interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  frequency: string;
  dayOfMonth: number;
  active: boolean;
  lastGenerated: string;
}

const categories = ["rent", "utilities", "salary", "supplies", "maintenance", "marketing", "general", "other"];

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function RecurringExpensesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<RecurringExpense> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "front_desk") router.replace("/admin/accounting");
  }, [user, router]);

  if (user?.role === "front_desk") return null;
  const [generating, setGenerating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounting/recurring");
      if (res.ok) setItems(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!editing) return;
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/admin/accounting/recurring" : `/api/admin/accounting/recurring/${editing.id}`;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (res.ok) {
        showToast(isNew ? "Recurring expense added" : "Recurring expense updated");
        setEditing(null);
        setIsNew(false);
        loadData();
      }
    } catch {
      showToast("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/accounting/recurring/${id}`, { method: "DELETE" });
      showToast("Recurring expense deleted");
      setDeleteConfirm(null);
      loadData();
    } catch {
      showToast("Failed to delete");
    }
  };

  const handleToggleActive = async (item: RecurringExpense) => {
    try {
      await fetch(`/api/admin/accounting/recurring/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, active: !item.active }),
      });
      showToast(item.active ? "Paused" : "Activated");
      loadData();
    } catch {
      showToast("Failed to update");
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/accounting/recurring", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        loadData();
      } else {
        showToast(data.error || "Failed to generate");
      }
    } catch {
      showToast("Failed to generate");
    }
    setGenerating(false);
  };

  const totalMonthly = items.filter(i => i.active).reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-white px-4 py-2 rounded-lg shadow-lg text-sm">{toast}</div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/accounting" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recurring Expenses</h1>
            <p className="text-gray-600 text-sm">Auto-generate monthly expenses like rent & salaries</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            Generate This Month
          </button>
          <button
            onClick={() => {
              setEditing({ description: "", amount: 0, category: "general", frequency: "monthly", dayOfMonth: 1, active: true });
              setIsNew(true);
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Recurring
          </button>
        </div>
      </div>

      {/* Total Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
        <div>
          <span className="text-gray-600 text-sm">Monthly Total (Active)</span>
          <span className="text-gray-400 text-xs ml-2">({items.filter(i => i.active).length} items)</span>
        </div>
        <span className="text-2xl font-bold text-red-500">{formatUSD(totalMonthly)}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No recurring expenses configured yet
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Description</th>
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Category</th>
                <th className="text-center text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Day</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Last Generated</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!item.active ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`p-1.5 rounded-lg transition-colors ${item.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                      title={item.active ? "Active - Click to pause" : "Paused - Click to activate"}
                    >
                      {item.active ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-gray-900 text-sm font-medium">{item.description}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{item.category}</span>
                  </td>
                  <td className="px-5 py-3 text-center text-gray-600 text-sm">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.dayOfMonth}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-red-500 font-medium text-sm">{formatUSD(item.amount)}</td>
                  <td className="px-5 py-3 text-gray-500 text-sm">
                    {item.lastGenerated ? new Date(item.lastGenerated + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Never"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditing(item); setIsNew(false); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Save className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5 text-red-500/40" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-gray-900 font-semibold mb-2">Delete Recurring Expense?</h3>
            <p className="text-gray-600 text-sm mb-4">This cannot be undone. Previously generated expenses will not be affected.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-semibold">{isNew ? "Add Recurring Expense" : "Edit Recurring Expense"}</h3>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Description</label>
                <input 
                  type="text" 
                  placeholder="e.g., Office Rent" 
                  value={editing.description || ""} 
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-primary" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Amount ($)</label>
                  <input 
                    type="number" 
                    min={0} 
                    step={0.01} 
                    value={editing.amount || ""} 
                    onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-primary" 
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Day of Month</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={28} 
                    value={editing.dayOfMonth || 1} 
                    onChange={(e) => setEditing({ ...editing, dayOfMonth: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-primary" 
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Category</label>
                <select 
                  value={editing.category || "general"} 
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-primary"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={!editing.description || !editing.amount}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isNew ? "Add Recurring Expense" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
