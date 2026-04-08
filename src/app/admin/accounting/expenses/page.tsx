"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, X, Save, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  period: string;
}

const categories = ["general", "rent", "utilities", "supplies", "salary", "maintenance", "marketing", "other"];

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function periodLabel(p: string) {
  const [y, m] = p.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function ExpensesPage() {
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState(() => {
    return searchParams.get("period") || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Expense> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/accounting/expenses?period=${period}`);
      if (res.ok) setExpenses(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [period]);

  useEffect(() => { loadData(); }, [loadData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const shiftPeriod = (dir: -1 | 1) => {
    const [y, m] = period.split("-").map(Number);
    const d = new Date(y, m - 1 + dir);
    setPeriod(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleSave = async () => {
    if (!editing) return;
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/admin/accounting/expenses" : `/api/admin/accounting/expenses/${editing.id}`;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (res.ok) {
        showToast(isNew ? "Expense added" : "Expense updated");
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
      await fetch(`/api/admin/accounting/expenses/${id}`, { method: "DELETE" });
      showToast("Expense deleted");
      setDeleteConfirm(null);
      loadData();
    } catch {
      showToast("Failed to delete");
    }
  };

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

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
            <h1 className="text-2xl font-bold text-white">Expenses</h1>
            <p className="text-gray-600 text-sm">Track clinic costs & overheads</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-1">
            <button onClick={() => shiftPeriod(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
            <span className="text-gray-900 font-medium text-sm min-w-[130px] text-center">{periodLabel(period)}</span>
            <button onClick={() => shiftPeriod(1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
          </div>
          <button
            onClick={() => {
              const defaultDate = `${period}-01`;
              setEditing({ date: defaultDate, description: "", amount: 0, category: "general" });
              setIsNew(true);
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Total Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
        <span className="text-gray-600 text-sm">Total Expenses — {periodLabel(period)}</span>
        <span className="text-2xl font-bold text-red-500">{formatUSD(total)}</span>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No expenses for {periodLabel(period)}</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Description</th>
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Category</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-700 text-sm">{exp.date}</td>
                  <td className="px-5 py-3 text-gray-900 text-sm">{exp.description}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{exp.category}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-red-500 font-medium text-sm">{formatUSD(exp.amount)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditing(exp); setIsNew(false); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Save className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button onClick={() => setDeleteConfirm(exp.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5 text-red-500/40" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-5 py-3 text-gray-900 font-semibold text-sm">TOTAL</td>
                <td className="px-5 py-3 text-right text-red-500 font-bold text-sm">{formatUSD(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-gray-900 font-semibold mb-2">Delete Expense?</h3>
            <p className="text-gray-600 text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-semibold">{isNew ? "Add Expense" : "Edit Expense"}</h3>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Date</label>
                <input type="date" value={editing.date || ""} onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Description</label>
                <input type="text" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-accent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Amount ($)</label>
                  <input type="number" min={0} step={0.01} value={editing.amount || ""} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Category</label>
                  <select value={editing.category || "general"} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-accent">
                    {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm">
                <Save className="w-4 h-4" />
                {isNew ? "Add" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
