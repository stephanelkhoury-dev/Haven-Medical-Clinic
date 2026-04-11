"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, Loader2, Check, Clock, DollarSign, Users, X } from "lucide-react";

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  specialty: string;
  period: string;
  grossAmount: number;
  paidAmount: number;
  paidDate: string;
  status: string;
  notes: string;
}

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function periodLabel(p: string) {
  const [y, m] = p.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function PayrollPage() {
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [paying, setPaying] = useState<PayrollRecord | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payNotes, setPayNotes] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/accounting/payroll?period=${period}`);
      if (res.ok) setPayroll(await res.json());
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

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/accounting/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        loadData();
      } else {
        showToast(data.error || "Failed");
      }
    } catch {
      showToast("Failed to generate");
    }
    setGenerating(false);
  };

  const handleMarkPaid = async () => {
    if (!paying) return;
    try {
      const res = await fetch("/api/admin/accounting/payroll", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: paying.id,
          paidAmount: payAmount,
          notes: payNotes,
        }),
      });
      if (res.ok) {
        showToast("Payment recorded");
        setPaying(null);
        setPayAmount(0);
        setPayNotes("");
        loadData();
      }
    } catch {
      showToast("Failed to save");
    }
  };

  const totalGross = payroll.reduce((s, p) => s + Number(p.grossAmount), 0);
  const totalPaid = payroll.reduce((s, p) => s + Number(p.paidAmount), 0);
  const paidCount = payroll.filter(p => p.status === "paid").length;
  const pendingCount = payroll.filter(p => p.status === "pending").length;

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
            <h1 className="text-2xl font-bold text-gray-900">Employee Payroll</h1>
            <p className="text-gray-600 text-sm">Track earnings & payments</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-1">
            <button onClick={() => shiftPeriod(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
            <span className="text-gray-900 font-medium text-sm min-w-[130px] text-center">{periodLabel(period)}</span>
            <button onClick={() => shiftPeriod(1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            Sync from Entries
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-gray-500 text-xs uppercase tracking-wider">Total Gross</span>
          </div>
          <p className="text-xl font-bold text-blue-600">{formatUSD(totalGross)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-gray-500 text-xs uppercase tracking-wider">Total Paid</span>
          </div>
          <p className="text-xl font-bold text-green-600">{formatUSD(totalPaid)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-gray-500 text-xs uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-xl font-bold text-orange-500">{formatUSD(totalGross - totalPaid)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-gray-500 text-xs uppercase tracking-wider">Status</span>
          </div>
          <p className="text-sm">
            <span className="text-green-600 font-medium">{paidCount} paid</span>
            <span className="text-gray-400 mx-1">·</span>
            <span className="text-orange-500 font-medium">{pendingCount} pending</span>
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : payroll.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">No payroll data for {periodLabel(period)}</p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="text-primary hover:underline text-sm"
          >
            Generate from entries
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Employee</th>
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Specialty</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Gross</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Paid</th>
                <th className="text-center text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Paid Date</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {payroll.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900 text-sm font-medium">{p.employeeName}</td>
                  <td className="px-5 py-3 text-gray-600 text-sm">{p.specialty}</td>
                  <td className="px-5 py-3 text-right text-blue-600 font-medium text-sm">{formatUSD(p.grossAmount)}</td>
                  <td className="px-5 py-3 text-right text-green-600 text-sm">{formatUSD(p.paidAmount)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      p.status === "paid" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-sm">{p.paidDate || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    {p.status !== "paid" && (
                      <button
                        onClick={() => { setPaying(p); setPayAmount(p.grossAmount); setPayNotes(p.notes || ""); }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg"
                      >
                        Mark Paid
                      </button>
                    )}
                    {p.status === "paid" && p.notes && (
                      <span className="text-gray-400 text-xs" title={p.notes}>📝</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pay Modal */}
      {paying && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-semibold">Record Payment</h3>
              <button onClick={() => setPaying(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              <span className="font-medium text-gray-900">{paying.employeeName}</span> · {periodLabel(paying.period)}
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Gross Earnings</label>
                <p className="text-xl font-bold text-blue-600">{formatUSD(paying.grossAmount)}</p>
              </div>
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Amount Paid ($)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={payAmount || ""}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-gray-600 text-xs uppercase tracking-wider mb-1 block">Notes (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Cash, Bank transfer"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={handleMarkPaid}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
              >
                <Check className="w-4 h-4" />
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
