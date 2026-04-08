"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, X, Save, ChevronLeft, ChevronRight, Loader2, Filter } from "lucide-react";

interface SplitRule {
  serviceType: string;
  employeePercent: number;
  clinicPercent: number;
  label: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  specialty: string;
  splitRules: SplitRule[];
}

interface Entry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  serviceType: string;
  description: string;
  amount: number;
  discount: number;
  employeeShare: number;
  clinicShare: number;
  period: string;
}

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function periodLabel(p: string) {
  const [y, m] = p.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function EntriesPage() {
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState(() => {
    return searchParams.get("period") || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  });
  const [employeeFilter, setEmployeeFilter] = useState<string>(searchParams.get("employee") || "");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Entry> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [previewSplit, setPreviewSplit] = useState<{ employee: number; clinic: number } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const empParam = employeeFilter ? `&employee_id=${employeeFilter}` : "";
      const [entriesRes, empRes] = await Promise.all([
        fetch(`/api/admin/accounting/entries?period=${period}${empParam}`),
        fetch("/api/admin/accounting/employees"),
      ]);
      if (entriesRes.ok) setEntries(await entriesRes.json());
      if (empRes.ok) setEmployees(await empRes.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [period, employeeFilter]);

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

  // Preview split calculation when editing
  const calculatePreview = (empId: string, serviceType: string, amount: number, discount: number) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) { setPreviewSplit(null); return; }
    const rule = emp.splitRules.find((r) => r.serviceType === serviceType) ||
                 emp.splitRules.find((r) => r.serviceType === "all");
    const net = amount - discount;
    if (!rule) {
      setPreviewSplit({ employee: 0, clinic: net });
      return;
    }
    const empShare = Math.round((amount * rule.employeePercent / 100) * 100) / 100;
    setPreviewSplit({ employee: empShare, clinic: Math.round((net - empShare) * 100) / 100 });
  };

  const handleSave = async () => {
    if (!editing) return;
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/admin/accounting/entries" : `/api/admin/accounting/entries/${editing.id}`;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (res.ok) {
        showToast(isNew ? "Entry added" : "Entry updated");
        setEditing(null);
        setIsNew(false);
        setPreviewSplit(null);
        loadData();
      }
    } catch {
      showToast("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/accounting/entries/${id}`, { method: "DELETE" });
      showToast("Entry deleted");
      setDeleteConfirm(null);
      loadData();
    } catch {
      showToast("Failed to delete");
    }
  };

  const selectedEmployee = employees.find((e) => e.id === employeeFilter);
  const totalAmount = entries.reduce((s, e) => s + Number(e.amount), 0);
  const totalDiscount = entries.reduce((s, e) => s + Number(e.discount), 0);
  const totalEmpShare = entries.reduce((s, e) => s + Number(e.employeeShare), 0);
  const totalClinicShare = entries.reduce((s, e) => s + Number(e.clinicShare), 0);

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
            <h1 className="text-2xl font-bold text-white">
              {selectedEmployee ? selectedEmployee.name : "All Entries"}
            </h1>
            <p className="text-gray-600 text-sm">
              {selectedEmployee ? selectedEmployee.specialty : "Revenue entries & split calculations"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-1">
            <button onClick={() => shiftPeriod(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
            <span className="text-gray-900 font-medium text-sm min-w-[130px] text-center">{periodLabel(period)}</span>
            <button onClick={() => shiftPeriod(1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
          </div>
          <button
            onClick={() => {
              const defaultDate = `${period}-${String(new Date().getDate()).padStart(2, "0")}`;
              setEditing({
                employeeId: employeeFilter || "",
                date: defaultDate,
                serviceType: "",
                description: "",
                amount: 0,
                discount: 0,
              });
              setIsNew(true);
              setPreviewSplit(null);
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        <button
          onClick={() => setEmployeeFilter("")}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!employeeFilter ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:text-white'}`}
        >
          All
        </button>
        {employees.map((emp) => (
          <button
            key={emp.id}
            onClick={() => setEmployeeFilter(emp.id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${employeeFilter === emp.id ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:text-white'}`}
          >
            {emp.name}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Amount</p>
          <p className="text-xl font-bold text-white">{formatUSD(totalAmount)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Discounts</p>
          <p className="text-xl font-bold text-red-500">{formatUSD(totalDiscount)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Employee Share</p>
          <p className="text-xl font-bold text-blue-600">{formatUSD(totalEmpShare)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Clinic Share</p>
          <p className="text-xl font-bold text-green-600">{formatUSD(totalClinicShare)}</p>
        </div>
      </div>

      {/* Entries Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No entries for {selectedEmployee ? selectedEmployee.name + " in " : ""}{periodLabel(period)}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Date</th>
                  {!employeeFilter && <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Employee</th>}
                  <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Service</th>
                  <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Description</th>
                  <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Discount</th>
                  <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Employee</th>
                  <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Clinic</th>
                  <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700 text-sm">{entry.date}</td>
                    {!employeeFilter && <td className="px-5 py-3 text-gray-900 text-sm font-medium">{entry.employeeName}</td>}
                    <td className="px-5 py-3">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {entry.serviceType || "general"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-800 text-sm">{entry.description}</td>
                    <td className="px-5 py-3 text-right text-gray-900 font-medium text-sm">{formatUSD(entry.amount)}</td>
                    <td className="px-5 py-3 text-right text-red-500/70 text-sm">{entry.discount > 0 ? `-${formatUSD(entry.discount)}` : "—"}</td>
                    <td className="px-5 py-3 text-right text-blue-600 text-sm">{formatUSD(entry.employeeShare)}</td>
                    <td className="px-5 py-3 text-right text-green-600 text-sm">{formatUSD(entry.clinicShare)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => { setEditing(entry); setIsNew(false); setPreviewSplit(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <Save className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button onClick={() => setDeleteConfirm(entry.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5 text-red-500/40" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={employeeFilter ? 3 : 4} className="px-5 py-3 text-gray-900 font-semibold text-sm">TOTAL</td>
                  <td className="px-5 py-3 text-right text-gray-900 font-bold text-sm">{formatUSD(totalAmount)}</td>
                  <td className="px-5 py-3 text-right text-red-500 font-bold text-sm">{totalDiscount > 0 ? `-${formatUSD(totalDiscount)}` : "—"}</td>
                  <td className="px-5 py-3 text-right text-blue-600 font-bold text-sm">{formatUSD(totalEmpShare)}</td>
                  <td className="px-5 py-3 text-right text-green-600 font-bold text-sm">{formatUSD(totalClinicShare)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-gray-900 font-semibold mb-2">Delete Entry?</h3>
            <p className="text-gray-600 text-sm mb-4">This cannot be undone.</p>
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
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-semibold">{isNew ? "Add Entry" : "Edit Entry"}</h3>
              <button onClick={() => { setEditing(null); setIsNew(false); setPreviewSplit(null); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Employee */}
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Employee</label>
                <select
                  value={editing.employeeId || ""}
                  onChange={(e) => {
                    const empId = e.target.value;
                    setEditing({ ...editing, employeeId: empId, serviceType: "" });
                    if (empId && editing.amount) {
                      calculatePreview(empId, "", Number(editing.amount), Number(editing.discount) || 0);
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-accent"
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} — {emp.specialty}</option>
                  ))}
                </select>
              </div>

              {/* Service Type (based on employee's split rules) */}
              {editing.employeeId && (() => {
                const emp = employees.find((e) => e.id === editing.employeeId);
                if (!emp || emp.splitRules.length <= 1) return null;
                return (
                  <div>
                    <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Service Type</label>
                    <select
                      value={editing.serviceType || ""}
                      onChange={(e) => {
                        const st = e.target.value;
                        setEditing({ ...editing, serviceType: st });
                        calculatePreview(editing.employeeId!, st, Number(editing.amount) || 0, Number(editing.discount) || 0);
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-accent"
                    >
                      <option value="">Select service type</option>
                      {emp.splitRules.map((rule) => (
                        <option key={rule.serviceType} value={rule.serviceType}>
                          {rule.label} ({rule.employeePercent}% / {rule.clinicPercent}%)
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

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
                  <input type="number" min={0} step={0.01} value={editing.amount || ""}
                    onChange={(e) => {
                      const amt = Number(e.target.value);
                      setEditing({ ...editing, amount: amt });
                      if (editing.employeeId) {
                        calculatePreview(editing.employeeId, editing.serviceType || "", amt, Number(editing.discount) || 0);
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Discount ($)</label>
                  <input type="number" min={0} step={0.01} value={editing.discount || ""}
                    onChange={(e) => {
                      const disc = Number(e.target.value);
                      setEditing({ ...editing, discount: disc });
                      if (editing.employeeId) {
                        calculatePreview(editing.employeeId, editing.serviceType || "", Number(editing.amount) || 0, disc);
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-accent" />
                </div>
              </div>

              {/* Split Preview */}
              {previewSplit && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="text-gray-400 text-xs uppercase mb-2">Split Preview</p>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee gets:</span>
                    <span className="text-blue-600 font-medium">{formatUSD(previewSplit.employee)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Clinic gets:</span>
                    <span className="text-green-600 font-medium">{formatUSD(previewSplit.clinic)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => { setEditing(null); setIsNew(false); setPreviewSplit(null); }} className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={!editing.employeeId || !editing.amount}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
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
