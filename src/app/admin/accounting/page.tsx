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
  BarChart3,
  RefreshCw,
  Wallet,
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const gt = summary?.grandTotal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounting</h1>
          <p className="text-gray-500 text-sm mt-1">Financial overview & revenue tracking</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-2 py-1">
          <button onClick={() => shiftPeriod(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-gray-900 font-medium text-sm min-w-[140px] text-center">
            {periodLabel(period)}
          </span>
          <button onClick={() => shiftPeriod(1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href={`/admin/accounting/entries?period=${period}`}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <Receipt className="w-5 h-5 text-primary mb-2" />
          <p className="text-gray-900 font-medium text-sm">Entries</p>
          <p className="text-gray-400 text-xs">Add & manage</p>
        </Link>
        <Link href={`/admin/accounting/employees`}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-gray-900 font-medium text-sm">Employees</p>
          <p className="text-gray-400 text-xs">Staff & splits</p>
        </Link>
        <Link href={`/admin/accounting/expenses?period=${period}`}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <TrendingDown className="w-5 h-5 text-red-500 mb-2" />
          <p className="text-gray-900 font-medium text-sm">Expenses</p>
          <p className="text-gray-400 text-xs">Track costs</p>
        </Link>
        <Link href={`/admin/accounting/products?period=${period}`}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <ShoppingBag className="w-5 h-5 text-primary mb-2" />
          <p className="text-gray-900 font-medium text-sm">Products</p>
          <p className="text-gray-400 text-xs">Sales tracking</p>
        </Link>
      </div>

      {/* Secondary Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link href="/admin/accounting/recurring"
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <RefreshCw className="w-5 h-5 text-orange-500 mb-2" />
          <p className="text-gray-900 font-medium text-sm">Recurring</p>
          <p className="text-gray-400 text-xs">Auto expenses</p>
        </Link>
        <Link href={`/admin/accounting/payroll?period=${period}`}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <Wallet className="w-5 h-5 text-green-600 mb-2" />
          <p className="text-gray-900 font-medium text-sm">Payroll</p>
          <p className="text-gray-400 text-xs">Employee payments</p>
        </Link>
        <Link href="/admin/accounting/analytics"
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <BarChart3 className="w-5 h-5 text-violet-500 mb-2" />
          <p className="text-gray-900 font-medium text-sm">Analytics</p>
          <p className="text-gray-400 text-xs">Charts & export</p>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <span className="text-gray-500 text-xs uppercase tracking-wider">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatUSD(gt?.totalAmount || 0)}</p>
          <p className="text-gray-400 text-xs mt-1">Discounts: {formatUSD(gt?.totalDiscount || 0)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-gray-500 text-xs uppercase tracking-wider">Clinic Share</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatUSD(gt?.totalClinicShare || 0)}</p>
          <p className="text-gray-400 text-xs mt-1">+ Products: {formatUSD(gt?.productClinicShare || 0)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-gray-500 text-xs uppercase tracking-wider">Employee Payouts</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatUSD(gt?.totalEmployeeShare || 0)}</p>
          <p className="text-gray-400 text-xs mt-1">{summary?.employees.filter(e => e.entryCount > 0).length || 0} active staff</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-gray-500 text-xs uppercase tracking-wider">Net Revenue</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatUSD(gt?.netClinicRevenue || 0)}</p>
          <p className="text-gray-400 text-xs mt-1">Expenses: {formatUSD(gt?.totalExpenses || 0)}</p>
        </div>
      </div>

      {/* Employee Breakdown Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Employee Breakdown</h2>
          <p className="text-gray-500 text-sm">{periodLabel(period)}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Employee</th>
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Specialty</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Entries</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Discount</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Employee</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3">Clinic</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {summary?.employees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-gray-900 font-medium text-sm">{emp.name}</span>
                    <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{emp.role}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-sm">{emp.specialty}</td>
                  <td className="px-5 py-3 text-right text-gray-600 text-sm">{emp.entryCount}</td>
                  <td className="px-5 py-3 text-right text-gray-900 font-medium text-sm">{formatUSD(emp.totalAmount)}</td>
                  <td className="px-5 py-3 text-right text-red-500 text-sm">{emp.totalDiscount > 0 ? `-${formatUSD(emp.totalDiscount)}` : "—"}</td>
                  <td className="px-5 py-3 text-right text-blue-600 text-sm">{formatUSD(emp.totalEmployeeShare)}</td>
                  <td className="px-5 py-3 text-right text-green-600 text-sm">{formatUSD(emp.totalClinicShare)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/accounting/entries?period=${period}&employee=${emp.id}`}
                      className="text-primary hover:text-primary-dark transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td className="px-5 py-3 text-gray-900 font-semibold text-sm" colSpan={3}>TOTAL</td>
                <td className="px-5 py-3 text-right text-gray-900 font-bold text-sm">{formatUSD(gt?.totalAmount || 0)}</td>
                <td className="px-5 py-3 text-right text-red-600 font-bold text-sm">{(gt?.totalDiscount || 0) > 0 ? `-${formatUSD(gt?.totalDiscount || 0)}` : "—"}</td>
                <td className="px-5 py-3 text-right text-blue-600 font-bold text-sm">{formatUSD(gt?.totalEmployeeShare || 0)}</td>
                <td className="px-5 py-3 text-right text-green-600 font-bold text-sm">{formatUSD(gt?.totalClinicShare || 0)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Products & Expenses Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Products Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-semibold">Products</h3>
            <Link href={`/admin/accounting/products?period=${period}`} className="text-primary text-sm hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Facial Products (Roula 90%)</span>
              <span className="text-gray-900 font-medium text-sm">{formatUSD(summary?.products.facialTotal || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Nail Products (Ghinwa 10%)</span>
              <span className="text-gray-900 font-medium text-sm">{formatUSD(summary?.products.nailTotal || 0)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <span className="text-gray-600 text-sm">Clinic Share</span>
              <span className="text-green-600 font-bold text-sm">{formatUSD(summary?.products.clinicShare || 0)}</span>
            </div>
          </div>
        </div>

        {/* Expenses Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-semibold">Expenses</h3>
            <Link href={`/admin/accounting/expenses?period=${period}`} className="text-primary text-sm hover:underline">
              View all →
            </Link>
          </div>
          <div className="flex items-center justify-center h-20">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{formatUSD(summary?.expenses || 0)}</p>
              <p className="text-gray-400 text-xs mt-1">Total expenses this period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Net Revenue Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-emerald-100 border border-primary/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm uppercase tracking-wider">Net Clinic Revenue</p>
            <p className="text-gray-400 text-xs mt-1">Clinic shares + product shares − expenses</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatUSD(gt?.netClinicRevenue || 0)}</p>
        </div>
      </div>
    </div>
  );
}
