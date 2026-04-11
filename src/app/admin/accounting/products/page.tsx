"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, X, Save, ChevronLeft, ChevronRight, Loader2, CheckSquare, Square } from "lucide-react";

interface Product {
  id: string;
  date: string;
  productType: string;
  description: string;
  amount: number;
  operatorName: string;
  operatorShare: number;
  clinicShare: number;
  period: string;
  inAudit: boolean;
}

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function periodLabel(p: string) {
  const [y, m] = p.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState(() => {
    return searchParams.get("period") || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/accounting/products?period=${period}`);
      if (res.ok) setProducts(await res.json());
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
    try {
      const res = await fetch("/api/admin/accounting/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (res.ok) {
        showToast("Product sale added");
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
      await fetch(`/api/admin/accounting/products/${id}`, { method: "DELETE" });
      showToast("Product entry deleted");
      setDeleteConfirm(null);
      loadData();
    } catch {
      showToast("Failed to delete");
    }
  };

  const toggleAudit = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/accounting/audit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "acc_products", id, inAudit: !currentStatus }),
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === id ? { ...p, inAudit: !currentStatus } : p));
        showToast(`Product ${!currentStatus ? "added to" : "removed from"} audit`);
      }
    } catch {
      showToast("Failed to update audit status");
    }
  };

  const toggleAllAudit = async (inAudit: boolean) => {
    const ids = products.map(p => p.id);
    if (ids.length === 0) return;
    try {
      const res = await fetch("/api/admin/accounting/audit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "acc_products", ids, inAudit }),
      });
      if (res.ok) {
        setProducts(products.map(p => ({ ...p, inAudit })));
        showToast(`All products ${inAudit ? "added to" : "removed from"} audit`);
      }
    } catch {
      showToast("Failed to update audit status");
    }
  };

  const facialProducts = products.filter((p) => p.productType === "facial");
  const nailProducts = products.filter((p) => p.productType === "nail");
  const facialTotal = facialProducts.reduce((s, p) => s + Number(p.amount), 0);
  const nailTotal = nailProducts.reduce((s, p) => s + Number(p.amount), 0);
  const totalOperator = products.reduce((s, p) => s + Number(p.operatorShare), 0);
  const totalClinic = products.reduce((s, p) => s + Number(p.clinicShare), 0);

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
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 text-sm">Facial (Roula 90%) & Nail (Ghinwa 10%) product sales</p>
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
              setEditing({ date: defaultDate, productType: "facial", description: "", amount: 0 });
              setIsNew(true);
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Sale
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Facial Total</p>
          <p className="text-xl font-bold text-gray-900">{formatUSD(facialTotal)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Nail Total</p>
          <p className="text-xl font-bold text-gray-900">{formatUSD(nailTotal)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Operator Share</p>
          <p className="text-xl font-bold text-blue-600">{formatUSD(totalOperator)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Clinic Share</p>
          <p className="text-xl font-bold text-green-600">{formatUSD(totalClinic)}</p>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No product sales for {periodLabel(period)}</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-center text-gray-600 text-xs uppercase tracking-wider px-3 py-3">
                  <button
                    onClick={() => toggleAllAudit(!products.every(p => p.inAudit))}
                    title={products.every(p => p.inAudit) ? "Remove all from audit" : "Add all to audit"}
                    className="hover:bg-gray-100 p-1 rounded"
                  >
                    {products.every(p => p.inAudit) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-gray-400" />}
                  </button>
                </th>
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Description</th>
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Operator</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Operator</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Clinic</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!p.inAudit ? 'opacity-50' : ''}`}>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => toggleAudit(p.id, p.inAudit)}
                      title={p.inAudit ? "Remove from audit" : "Add to audit"}
                      className="hover:bg-gray-100 p-1 rounded"
                    >
                      {p.inAudit ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-gray-700 text-sm">{p.date}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${p.productType === 'facial' ? 'bg-pink-500/20 text-pink-400' : 'bg-purple-500/20 text-purple-400'}`}>
                      {p.productType}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-900 text-sm">{p.description}</td>
                  <td className="px-5 py-3 text-gray-600 text-sm">{p.operatorName}</td>
                  <td className="px-5 py-3 text-right text-gray-900 font-medium text-sm">{formatUSD(p.amount)}</td>
                  <td className="px-5 py-3 text-right text-blue-600 text-sm">{formatUSD(p.operatorShare)}</td>
                  <td className="px-5 py-3 text-right text-green-600 text-sm">{formatUSD(p.clinicShare)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5 text-red-500/40" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={4} className="px-5 py-3 text-gray-900 font-semibold text-sm">TOTAL</td>
                <td className="px-5 py-3 text-right text-gray-900 font-bold text-sm">{formatUSD(facialTotal + nailTotal)}</td>
                <td className="px-5 py-3 text-right text-blue-600 font-bold text-sm">{formatUSD(totalOperator)}</td>
                <td className="px-5 py-3 text-right text-green-600 font-bold text-sm">{formatUSD(totalClinic)}</td>
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
            <h3 className="text-gray-900 font-semibold mb-2">Delete Product Entry?</h3>
            <p className="text-gray-600 text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-semibold">Add Product Sale</h3>
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
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Product Type</label>
                <select value={editing.productType || "facial"} onChange={(e) => setEditing({ ...editing, productType: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-accent">
                  <option value="facial">Facial (Roula 90%)</option>
                  <option value="nail">Nail (Ghinwa 10%)</option>
                </select>
              </div>
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Description</label>
                <input type="text" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Amount ($)</label>
                <input type="number" min={0} step={0.01} value={editing.amount || ""} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-accent" />
              </div>
              {editing.amount ? (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="text-gray-400 text-xs uppercase mb-2">Preview Split</p>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {editing.productType === "facial" ? "Roula" : "Ghinwa"} gets:
                    </span>
                    <span className="text-blue-600 font-medium">
                      {formatUSD(editing.productType === "facial" ? (editing.amount || 0) * 0.9 : (editing.amount || 0) * 0.1)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Clinic gets:</span>
                    <span className="text-green-600 font-medium">
                      {formatUSD(editing.productType === "facial" ? (editing.amount || 0) * 0.1 : (editing.amount || 0) * 0.9)}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm">
                <Save className="w-4 h-4" />
                Add Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
