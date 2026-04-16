"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../layout";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface MonthlyTrend {
  period: string;
  label: string;
  revenue: number;
  discount: number;
  employeeShare: number;
  clinicShare: number;
  expenses: number;
  netRevenue: number;
  products: number;
  entries: number;
}

interface EmployeePerf {
  id: string;
  name: string;
  specialty: string;
  revenue: number;
  clinicShare: number;
  entries: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
}

interface Analytics {
  monthlyTrends: MonthlyTrend[];
  employeePerformance: EmployeePerf[];
  expenseBreakdown: ExpenseCategory[];
  ytd: {
    revenue: number;
    clinicShare: number;
    expenses: number;
    netRevenue: number;
  };
  monthOverMonth: {
    revenueChange: number;
    netRevenueChange: number | null;
    expenseChange: number | null;
  } | null;
  currentPeriod: string;
}

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#84cc16"];
const CATEGORY_COLORS: Record<string, string> = {
  rent: "#ef4444",
  utilities: "#f59e0b",
  salary: "#8b5cf6",
  supplies: "#06b6d4",
  maintenance: "#10b981",
  marketing: "#ec4899",
  general: "#6366f1",
  other: "#94a3b8",
};

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

function formatCompact(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function ChangeIndicator({ value, suffix = "%" }: { value: number | null; suffix?: string }) {
  if (value === null) return <span className="text-gray-400 text-sm">N/A</span>;
  const isPositive = value >= 0;
  return (
    <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
      {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
      {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
}

export default function AccountingAnalytics() {
  const { user } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "front_desk") router.replace("/admin/accounting");
  }, [user, router]);

  if (user?.role === "front_desk") return null;

  const [months, setMonths] = useState(6);
  const [exporting, setExporting] = useState(false);
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/accounting/analytics?months=${months}`;
      if (useCustomRange) {
        url = `/api/admin/accounting/analytics?start=${startDate}&end=${endDate}`;
      }
      const res = await fetch(url);
      if (res.ok) setAnalytics(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [months, useCustomRange, startDate, endDate]);

  const downloadExcel = async (auditOnly: boolean) => {
    setExporting(true);
    try {
      const period = analytics?.currentPeriod || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
      const res = await fetch(`/api/admin/accounting/export?period=${period}&audit_only=${auditOnly}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `haven-accounting-${period}${auditOnly ? "-audit" : ""}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch { /* ignore */ }
    setExporting(false);
  };

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-16 text-gray-500">
        Unable to load analytics data
      </div>
    );
  }

  const { monthlyTrends, employeePerformance, expenseBreakdown, ytd, monthOverMonth } = analytics;

  // Prepare pie chart data with colors
  const pieData = expenseBreakdown.map((e, i) => ({
    ...e,
    color: CATEGORY_COLORS[e.category] || COLORS[i % COLORS.length],
  }));

  const totalExpenses = pieData.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/accounting" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-500 text-sm">Revenue trends, performance metrics & insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadExcel(false)}
            disabled={exporting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Full Report
          </button>
          <button
            onClick={() => downloadExcel(true)}
            disabled={exporting}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Audit Only
          </button>
        </div>
      </div>

      {/* Date Range Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseCustomRange(false)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!useCustomRange ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Quick
          </button>
          <button
            onClick={() => setUseCustomRange(true)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${useCustomRange ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Custom Range
          </button>
        </div>

        {!useCustomRange ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Show:</span>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-500 text-sm">From:</span>
            <input
              type="month"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-gray-500 text-sm">To:</span>
            <input
              type="month"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            {monthOverMonth && <ChangeIndicator value={monthOverMonth.revenueChange} />}
          </div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Monthly Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatUSD(monthlyTrends[monthlyTrends.length - 1]?.revenue || 0)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            {monthOverMonth && <ChangeIndicator value={monthOverMonth.netRevenueChange} />}
          </div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Net Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatUSD(monthlyTrends[monthlyTrends.length - 1]?.netRevenue || 0)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            {monthOverMonth && <ChangeIndicator value={monthOverMonth.expenseChange} />}
          </div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Monthly Expenses</p>
          <p className="text-2xl font-bold text-red-500">{formatUSD(monthlyTrends[monthlyTrends.length - 1]?.expenses || 0)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">YTD Net Revenue</p>
          <p className="text-2xl font-bold text-blue-600">{formatUSD(ytd.netRevenue)}</p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
            <p className="text-gray-500 text-sm">Monthly revenue, clinic share & net revenue</p>
          </div>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip
                formatter={(value) => formatUSD(Number(value) || 0)}
                contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Total Revenue"
                stroke="#8b5cf6"
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="netRevenue"
                name="Net Revenue"
                stroke="#10b981"
                fill="url(#colorNet)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#ef4444', r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Breakdown Bar Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Revenue Distribution</h2>
            <p className="text-gray-500 text-sm">Employee vs clinic share breakdown</p>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip
                formatter={(value) => formatUSD(Number(value) || 0)}
                contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="employeeShare" name="Employee Share" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clinicShare" name="Clinic Share" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Performance */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
              <p className="text-gray-500 text-sm">This month&apos;s revenue by employee</p>
            </div>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeePerformance.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                <XAxis type="number" tickFormatter={(v) => formatCompact(v)} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: '#374151', fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => formatUSD(Number(value) || 0)}
                  contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Expense Breakdown</h2>
              <p className="text-gray-500 text-sm">This month by category</p>
            </div>
            <PieChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          {totalExpenses > 0 ? (
            <div className="h-72 flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatUSD(Number(value) || 0)}
                    contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-gray-600 capitalize">{entry.category}</span>
                    </div>
                    <span className="text-gray-900 font-medium">{formatUSD(entry.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400">
              No expenses this month
            </div>
          )}
        </div>
      </div>

      {/* Monthly Comparison Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Comparison</h2>
          <p className="text-gray-500 text-sm">Detailed breakdown by month</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-gray-600 text-xs uppercase tracking-wider px-6 py-3">Month</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-6 py-3">Revenue</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-6 py-3">Employee Share</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-6 py-3">Clinic Share</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-6 py-3">Expenses</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-6 py-3">Net Revenue</th>
                <th className="text-right text-gray-600 text-xs uppercase tracking-wider px-6 py-3">Entries</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTrends.map((m, i) => (
                <tr key={m.period} className={`border-b border-gray-100 ${i === monthlyTrends.length - 1 ? 'bg-primary/5' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 text-gray-900 font-medium text-sm">
                    {new Date(m.period + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900 font-medium text-sm">{formatUSD(m.revenue)}</td>
                  <td className="px-6 py-4 text-right text-blue-600 text-sm">{formatUSD(m.employeeShare)}</td>
                  <td className="px-6 py-4 text-right text-green-600 text-sm">{formatUSD(m.clinicShare)}</td>
                  <td className="px-6 py-4 text-right text-red-500 text-sm">{formatUSD(m.expenses)}</td>
                  <td className="px-6 py-4 text-right font-bold text-sm">
                    <span className={m.netRevenue >= 0 ? "text-green-600" : "text-red-500"}>
                      {formatUSD(m.netRevenue)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 text-sm">{m.entries}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td className="px-6 py-4 text-gray-900 text-sm">YTD Total</td>
                <td className="px-6 py-4 text-right text-gray-900 text-sm">{formatUSD(ytd.revenue)}</td>
                <td className="px-6 py-4 text-right text-blue-600 text-sm">—</td>
                <td className="px-6 py-4 text-right text-green-600 text-sm">{formatUSD(ytd.clinicShare)}</td>
                <td className="px-6 py-4 text-right text-red-500 text-sm">{formatUSD(ytd.expenses)}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <span className={ytd.netRevenue >= 0 ? "text-green-600" : "text-red-500"}>
                    {formatUSD(ytd.netRevenue)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-500 text-sm">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
