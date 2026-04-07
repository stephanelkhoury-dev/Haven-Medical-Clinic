"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, X, Save, Loader2 } from "lucide-react";

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
  sortOrder: number;
  active: boolean;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounting/employees");
      if (res.ok) setEmployees(await res.json());
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
    const url = isNew ? "/api/admin/accounting/employees" : `/api/admin/accounting/employees/${editing.id}`;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (res.ok) {
        showToast(isNew ? "Employee added" : "Employee updated");
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
      await fetch(`/api/admin/accounting/employees/${id}`, { method: "DELETE" });
      showToast("Employee deleted");
      setDeleteConfirm(null);
      loadData();
    } catch {
      showToast("Failed to delete");
    }
  };

  const addRule = () => {
    if (!editing) return;
    setEditing({
      ...editing,
      splitRules: [...editing.splitRules, { serviceType: "", employeePercent: 0, clinicPercent: 100, label: "" }],
    });
  };

  const updateRule = (idx: number, field: keyof SplitRule, value: string | number) => {
    if (!editing) return;
    const rules = [...editing.splitRules];
    rules[idx] = { ...rules[idx], [field]: value };
    // Auto-sync percentages
    if (field === "employeePercent") {
      rules[idx].clinicPercent = 100 - Number(value);
    } else if (field === "clinicPercent") {
      rules[idx].employeePercent = 100 - Number(value);
    }
    setEditing({ ...editing, splitRules: rules });
  };

  const removeRule = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, splitRules: editing.splitRules.filter((_, i) => i !== idx) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-accent text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/accounting" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Employees</h1>
            <p className="text-white/60 text-sm">Manage staff & revenue split rules</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditing({ id: "", name: "", role: "operator", specialty: "", splitRules: [{ serviceType: "all", employeePercent: 0, clinicPercent: 100, label: "All Services" }], sortOrder: employees.length + 1, active: true });
            setIsNew(true);
          }}
          className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <div key={emp.id} className={`bg-card border rounded-xl p-5 ${emp.active ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold">{emp.name}</h3>
                <p className="text-white/50 text-sm">{emp.specialty}</p>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 mt-1 inline-block">
                  {emp.role}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(emp); setIsNew(false); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-white/40" />
                </button>
                <button onClick={() => setDeleteConfirm(emp.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-red-400/40" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5 mt-3">
              <p className="text-white/40 text-xs uppercase tracking-wider">Split Rules</p>
              {emp.splitRules.map((rule, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{rule.label || rule.serviceType}</span>
                  <span className="text-white/80">
                    <span className="text-blue-400">{rule.employeePercent}%</span>
                    <span className="text-white/30 mx-1">/</span>
                    <span className="text-green-400">{rule.clinicPercent}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-white font-semibold mb-2">Delete Employee?</h3>
            <p className="text-white/60 text-sm mb-4">This will also delete all their accounting entries. This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-white/60 hover:text-white text-sm transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-white/10 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">{isNew ? "Add Employee" : "Edit Employee"}</h3>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider mb-1 block">Name</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider mb-1 block">Role</label>
                  <select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent">
                    <option value="doctor">Doctor</option>
                    <option value="operator">Operator</option>
                    <option value="therapist">Therapist</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider mb-1 block">Specialty</label>
                  <input type="text" value={editing.specialty} onChange={(e) => setEditing({ ...editing, specialty: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider mb-1 block">Sort Order</label>
                  <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                    <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                      className="accent-accent" />
                    Active
                  </label>
                </div>
              </div>

              {/* Split Rules */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white/60 text-xs uppercase tracking-wider">Revenue Split Rules</label>
                  <button onClick={addRule} className="text-accent text-xs hover:underline">+ Add Rule</button>
                </div>
                <div className="space-y-3">
                  {editing.splitRules.map((rule, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <input type="text" placeholder="Service type key" value={rule.serviceType}
                          onChange={(e) => updateRule(i, "serviceType", e.target.value)}
                          className="bg-transparent border border-white/10 rounded px-2 py-1 text-white text-sm w-32 focus:outline-none focus:border-accent" />
                        <input type="text" placeholder="Label" value={rule.label}
                          onChange={(e) => updateRule(i, "label", e.target.value)}
                          className="bg-transparent border border-white/10 rounded px-2 py-1 text-white text-sm w-32 focus:outline-none focus:border-accent" />
                        {editing.splitRules.length > 1 && (
                          <button onClick={() => removeRule(i)} className="p-1 hover:bg-red-500/10 rounded">
                            <X className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-white/40 text-[10px] uppercase">Employee %</label>
                          <input type="number" min={0} max={100} value={rule.employeePercent}
                            onChange={(e) => updateRule(i, "employeePercent", Number(e.target.value))}
                            className="w-full bg-transparent border border-white/10 rounded px-2 py-1 text-blue-400 text-sm focus:outline-none focus:border-accent" />
                        </div>
                        <div>
                          <label className="text-white/40 text-[10px] uppercase">Clinic %</label>
                          <input type="number" min={0} max={100} value={rule.clinicPercent}
                            onChange={(e) => updateRule(i, "clinicPercent", Number(e.target.value))}
                            className="w-full bg-transparent border border-white/10 rounded px-2 py-1 text-green-400 text-sm focus:outline-none focus:border-accent" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-white/60 hover:text-white text-sm transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm transition-colors">
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
