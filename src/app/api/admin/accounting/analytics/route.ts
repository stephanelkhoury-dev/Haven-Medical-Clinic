import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get("months") || "6", 10);

    // Generate last N months
    const periods: string[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    // Monthly revenue trends
    const monthlyRevenue = await sql`
      SELECT
        period,
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(discount), 0) as total_discount,
        COALESCE(SUM(employee_share), 0) as employee_share,
        COALESCE(SUM(clinic_share), 0) as clinic_share,
        COUNT(*) as entry_count
      FROM acc_entries
      WHERE period = ANY(${periods})
      GROUP BY period
      ORDER BY period ASC
    `;

    // Monthly expenses
    const monthlyExpenses = await sql`
      SELECT
        period,
        COALESCE(SUM(amount), 0) as total_expenses
      FROM acc_expenses
      WHERE period = ANY(${periods})
      GROUP BY period
      ORDER BY period ASC
    `;

    // Monthly product sales
    const monthlyProducts = await sql`
      SELECT
        period,
        COALESCE(SUM(amount), 0) as total_products,
        COALESCE(SUM(clinic_share), 0) as clinic_share
      FROM acc_products
      WHERE period = ANY(${periods})
      GROUP BY period
      ORDER BY period ASC
    `;

    // Build combined monthly data
    const revenueMap = new Map(monthlyRevenue.map(r => [r.period, r]));
    const expenseMap = new Map(monthlyExpenses.map(e => [e.period, e]));
    const productMap = new Map(monthlyProducts.map(p => [p.period, p]));

    const monthlyTrends = periods.map(period => {
      const rev = revenueMap.get(period);
      const exp = expenseMap.get(period);
      const prod = productMap.get(period);
      
      const clinicShare = Number(rev?.clinic_share || 0) + Number(prod?.clinic_share || 0);
      const expenses = Number(exp?.total_expenses || 0);
      
      return {
        period,
        label: new Date(period + "-01").toLocaleDateString("en-US", { month: "short" }),
        revenue: Number(rev?.total_revenue || 0),
        discount: Number(rev?.total_discount || 0),
        employeeShare: Number(rev?.employee_share || 0),
        clinicShare,
        expenses,
        netRevenue: clinicShare - expenses,
        products: Number(prod?.total_products || 0),
        entries: Number(rev?.entry_count || 0),
      };
    });

    // Employee performance (current month)
    const currentPeriod = periods[periods.length - 1];
    const employeePerformance = await sql`
      SELECT
        emp.id,
        emp.name,
        emp.specialty,
        COALESCE(SUM(e.amount), 0) as total_revenue,
        COALESCE(SUM(e.clinic_share), 0) as clinic_share,
        COUNT(e.id) as entry_count
      FROM acc_employees emp
      LEFT JOIN acc_entries e ON emp.id = e.employee_id AND e.period = ${currentPeriod}
      WHERE emp.active = true
      GROUP BY emp.id, emp.name, emp.specialty
      ORDER BY total_revenue DESC
    `;

    // Expense breakdown by category (current month)
    const expenseBreakdown = await sql`
      SELECT
        category,
        COALESCE(SUM(amount), 0) as total
      FROM acc_expenses
      WHERE period = ${currentPeriod}
      GROUP BY category
      ORDER BY total DESC
    `;

    // YTD totals
    const yearStart = `${now.getFullYear()}-01`;
    const ytdTotals = await sql`
      SELECT
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(clinic_share), 0) as clinic_share
      FROM acc_entries
      WHERE period >= ${yearStart}
    `;

    const ytdExpenses = await sql`
      SELECT COALESCE(SUM(amount), 0) as total FROM acc_expenses WHERE period >= ${yearStart}
    `;

    const ytdProducts = await sql`
      SELECT COALESCE(SUM(clinic_share), 0) as clinic_share FROM acc_products WHERE period >= ${yearStart}
    `;

    // Previous month comparison
    const prevPeriod = periods.length > 1 ? periods[periods.length - 2] : null;
    let monthOverMonth = null;
    if (prevPeriod) {
      const currentData = monthlyTrends[monthlyTrends.length - 1];
      const prevData = monthlyTrends[monthlyTrends.length - 2];
      if (prevData && prevData.revenue > 0) {
        monthOverMonth = {
          revenueChange: ((currentData.revenue - prevData.revenue) / prevData.revenue) * 100,
          netRevenueChange: prevData.netRevenue !== 0 
            ? ((currentData.netRevenue - prevData.netRevenue) / Math.abs(prevData.netRevenue)) * 100 
            : null,
          expenseChange: prevData.expenses > 0 
            ? ((currentData.expenses - prevData.expenses) / prevData.expenses) * 100 
            : null,
        };
      }
    }

    return NextResponse.json({
      monthlyTrends,
      employeePerformance: employeePerformance.map(e => ({
        id: e.id,
        name: e.name,
        specialty: e.specialty,
        revenue: Number(e.total_revenue),
        clinicShare: Number(e.clinic_share),
        entries: Number(e.entry_count),
      })),
      expenseBreakdown: expenseBreakdown.map(e => ({
        category: e.category,
        amount: Number(e.total),
      })),
      ytd: {
        revenue: Number(ytdTotals[0]?.total_revenue || 0),
        clinicShare: Number(ytdTotals[0]?.clinic_share || 0) + Number(ytdProducts[0]?.clinic_share || 0),
        expenses: Number(ytdExpenses[0]?.total || 0),
        netRevenue: Number(ytdTotals[0]?.clinic_share || 0) + Number(ytdProducts[0]?.clinic_share || 0) - Number(ytdExpenses[0]?.total || 0),
      },
      monthOverMonth,
      currentPeriod,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
