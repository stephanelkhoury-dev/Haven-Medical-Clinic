"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Receipt,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

interface EmployeeSummary {
  id: string;
  name: string;
  specialty: string;
  role: string;
  totalAmount: number;
  totalDiscount: number;
  totalEmployeeShare: number;
  totalClinicShare: number;
  entryCount: number;
}

interface Summary {
  period: string;
  employees: EmployeeSummary[];
  products: {
    facialTotal: number;
    nailTotal: number;
    operatorShare: number;
    clinicShare: number;
  };
  expenses: number;
  grandTotal: {
    totalAmount: number;
    totalDiscount: number;
    totalEmployeeShare: number;
    totalClinicShare: number;
    productClinicShare: number;
    totalExpenses: number;
    netClinicRevenue: number;
  };
  availablePeriods: string[];
}

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function periodLabel(p: string) {
  const [y, m] = p.split("-");
  const date = new Date(Number(y), Number(m) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function AccountingDashboard() {
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/accounting/summary?period=${period}`);
      if (res.ok) setSummary(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [period]);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const shiftPeriod = (dir: -1 | 1) => {
    const [y, m] = period.split("-").map(Number);
    const d = new Date(y, m - 1 + dir);
    setPeriod(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const gt = summary?.grandTotal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Accounting</h1>
          <p className="text-white/60 text-sm mt-1">Financial overview & revenue tracking</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-card border border-white/10 rounded-xl px-2 py-1">
          <button onClick={() => shiftPeriod(-1)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-white/60" />
          </button>
          <span className="text-white font-medium text-sm min-w-[140px] text-center">
            {periodLabel(period)}
          </span>
          <button onClick={() => shiftPeriod(1)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href={`/admin/accounting/entries?period=${period}`}
          className="bg-card border border-white/10 rounded-xl p-4 hover:border-accent/50 transition-colors group">
          <Receipt className="w-5 h-5 text-accent mb-2" />
          <p className="text-white font-medium text-sm">Entries</p>
          <p className="text-white/40 text-xs">Add & manage</p>
        </Link>
        <Link href={`/admin/accounting/employees`}
          className="bg-card border border-white/10 rounded-xl p-4 hover:border-accent/50 transition-colors group">
          <Users className="w-5 h-5 text-accent mb-2" />
          <p className="text-white font-medium text-sm">Employees</p>
          <p className="text-white/40 text-xs">Staff & splits</p>
        </Link>
        <Link href={`/admin/accounting/expenses?period=${period}`}
          className="bg-card border border-white/10 rounded-xl p-4 hover:border-accent/50 transition-colors group">
          <TrendingDown className="w-5 h-5 text-red-400 mb-2" />
          <p className="text-white font-medium text-sm">Expenses</p>
          <p className="text-white/40 text-xs">Track costs</p>
        </Link>
        <Link href={`/admin/accounting/products?period=${period}`}
          className="bg-card border border-white/10 rounded-xl p-4 hover:border-accent/50 transition-colors group">
          <ShoppingBag className="w-5 h-5 text-accent mb-2" />
          <p className="text-white font-medium text-sm">Products</p>
          <p className="text-white/40 text-xs">Sales tracking</p>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <DollarSign className="w-4 h-4 text-accent" />
            </div>
            <span className="text-white/60 text-xs uppercase tracking-wider">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatUSD(gt?.totalAmount || 0)}</p>
          <p className="text-white/40 text-xs mt-1">Discounts: {formatUSD(gt?.totalDiscount || 0)}</p>
        </div>

        <div className="bg-card border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-white/60 text-xs uppercase tracking-wider">Clinic Share</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{formatUSD(gt?.totalClinicShare || 0)}</p>
          <p className="text-white/40 text-xs mt-1">+ Products: {formatUSD(gt?.productClinicShare || 0)}</p>
        </div>

        <div className="bg-card border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-white/60 text-xs uppercase tracking-wider">Employee Payouts</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{formatUSD(gt?.totalEmployeeShare || 0)}</p>
          <p className="text-white/40 text-xs mt-1">{summary?.employees.filter(e => e.entryCount > 0).length || 0} active staff</p>
        </div>

        <div className="bg-card border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-white/60 text-xs uppercase tracking-wider">Net Revenue</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{formatUSD(gt?.netClinicRevenue || 0)}</p>
          <p className="text-white/40 text-xs mt-1">Expenses: {formatUSD(gt?.totalExpenses || 0)}</p>
        </div>
      </div>

      {/* Employee Breakdown Table */}
      <div className="bg-card border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Employee Breakdown</h2>
          <p className="text-white/50 text-sm">{periodLabel(period)}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/60 text-xs uppercase tracking-wider px-5 py-3">Employee</th>
                <th className="text-left text-white/60 text-xs uppercase tracking-wider px-5 py-3">Specialty</th>
                <th className="text-right text-white/60 text-xs uppercase tracking-wider px-5 py-3">Entries</th>
                <th className="text-right text-white/60 text-xs uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-right text-white/60 text-xs uppercase tracking-wider px-5 py-3">Discount</th>
                <th className="text-right text-white/60 text-xs uppercase tracking-wider px-5 py-3">Employee</th>
                <th className="text-right text-white/60 text-xs uppercase tracking-wider px-5 py-3">Clinic</th>
                <th className="text-right text-white/60 text-xs uppercase tracking-wider px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {summary?.employees.map((emp) => (
                <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-white font-medium text-sm">{emp.name}</span>
                    <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">{emp.role}</span>
                  </td>
                  <td className="px-5 py-3 text-white/60 text-sm">{emp.specialty}</td>
                  <td className="px-5 py-3 text-right text-white/60 text-sm">{emp.entryCount}</td>
                  <td className="px-5 py-3 text-right text-white font-medium text-sm">{formatUSD(emp.totalAmount)}</td>
                  <td className="px-5 py-3 text-right text-red-400/70 text-sm">{emp.totalDiscount > 0 ? `-${formatUSD(emp.totalDiscount)}` : "—"}</td>
                  <td className="px-5 py-3 text-right text-blue-400 text-sm">{formatUSD(emp.totalEmployeeShare)}</td>
                  <td className="px-5 py-3 text-right text-green-400 text-sm">{formatUSD(emp.totalClinicShare)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/accounting/entries?period=${period}&employee=${emp.id}`}
                      className="text-accent hover:text-accent/80 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-white/5">
                <td className="px-5 py-3 text-white font-semibold text-sm" colSpan={3}>TOTAL</td>
                <td className="px-5 py-3 text-right text-white font-bold text-sm">{formatUSD(gt?.totalAmount || 0)}</td>
                <td className="px-5 py-3 text-right text-red-400 font-bold text-sm">{(gt?.totalDiscount || 0) > 0 ? `-${formatUSD(gt?.totalDiscount || 0)}` : "—"}</td>
                <td className="px-5 py-3 text-right text-blue-400 font-bold text-sm">{formatUSD(gt?.totalEmployeeShare || 0)}</td>
                <td className="px-5 py-3 text-right text-green-400 font-bold text-sm">{formatUSD(gt?.totalClinicShare || 0)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Products & Expenses Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Products Summary */}
        <div className="bg-card border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Products</h3>
            <Link href={`/admin/accounting/products?period=${period}`} className="text-accent text-sm hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Facial Products (Roula 90%)</span>
              <span className="text-white font-medium text-sm">{formatUSD(summary?.products.facialTotal || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Nail Products (Ghinwa 10%)</span>
              <span className="text-white font-medium text-sm">{formatUSD(summary?.products.nailTotal || 0)}</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <span className="text-white/60 text-sm">Clinic Share</span>
              <span className="text-green-400 font-bold text-sm">{formatUSD(summary?.products.clinicShare || 0)}</span>
            </div>
          </div>
        </div>

        {/* Expenses Summary */}
        <div className="bg-card border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Expenses</h3>
            <Link href={`/admin/accounting/expenses?period=${period}`} className="text-accent text-sm hover:underline">
              View all →
            </Link>
          </div>
          <div className="flex items-center justify-center h-20">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400">{formatUSD(summary?.expenses || 0)}</p>
              <p className="text-white/40 text-xs mt-1">Total expenses this period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Net Revenue Banner */}
      <div className="bg-gradient-to-r from-accent/20 to-emerald-500/20 border border-accent/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm uppercase tracking-wider">Net Clinic Revenue</p>
            <p className="text-white/40 text-xs mt-1">Clinic shares + product shares − expenses</p>
          </div>
          <p className="text-3xl font-bold text-white">{formatUSD(gt?.netClinicRevenue || 0)}</p>
        </div>
      </div>
    </div>
  );
}
