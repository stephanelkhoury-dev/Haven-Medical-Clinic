import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || new Date().toISOString().slice(0, 7);

    // Per-employee totals for the period
    const employeeTotals = await sql`
      SELECT
        emp.id,
        emp.name,
        emp.specialty,
        emp.role,
        COALESCE(SUM(e.amount), 0) as total_amount,
        COALESCE(SUM(e.discount), 0) as total_discount,
        COALESCE(SUM(e.employee_share), 0) as total_employee_share,
        COALESCE(SUM(e.clinic_share), 0) as total_clinic_share,
        COUNT(e.id) as entry_count
      FROM acc_employees emp
      LEFT JOIN acc_entries e ON emp.id = e.employee_id AND e.period = ${period}
      WHERE emp.active = true
      GROUP BY emp.id, emp.name, emp.specialty, emp.role
      ORDER BY emp.sort_order ASC
    `;

    // Total expenses for the period
    const expenseResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total FROM acc_expenses WHERE period = ${period}
    `;

    // Product totals for the period
    const productResult = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN product_type = 'facial' THEN amount ELSE 0 END), 0) as facial_total,
        COALESCE(SUM(CASE WHEN product_type = 'nail' THEN amount ELSE 0 END), 0) as nail_total,
        COALESCE(SUM(operator_share), 0) as total_operator_share,
        COALESCE(SUM(clinic_share), 0) as total_clinic_share
      FROM acc_products WHERE period = ${period}
    `;

    // Grand totals
    const grandTotalAmount = employeeTotals.reduce((sum, e) => sum + Number(e.total_amount), 0);
    const grandTotalDiscount = employeeTotals.reduce((sum, e) => sum + Number(e.total_discount), 0);
    const grandEmployeeShare = employeeTotals.reduce((sum, e) => sum + Number(e.total_employee_share), 0);
    const grandClinicShare = employeeTotals.reduce((sum, e) => sum + Number(e.total_clinic_share), 0);
    const totalExpenses = Number(expenseResult[0].total);
    const productClinicShare = Number(productResult[0].total_clinic_share);

    // Available periods
    const periods = await sql`
      SELECT DISTINCT period FROM (
        SELECT period FROM acc_entries
        UNION
        SELECT period FROM acc_expenses
        UNION
        SELECT period FROM acc_products
      ) p ORDER BY period DESC
    `;

    return NextResponse.json({
      period,
      employees: employeeTotals.map((e) => ({
        id: e.id,
        name: e.name,
        specialty: e.specialty,
        role: e.role,
        totalAmount: Number(e.total_amount),
        totalDiscount: Number(e.total_discount),
        totalEmployeeShare: Number(e.total_employee_share),
        totalClinicShare: Number(e.total_clinic_share),
        entryCount: Number(e.entry_count),
      })),
      products: {
        facialTotal: Number(productResult[0].facial_total),
        nailTotal: Number(productResult[0].nail_total),
        operatorShare: Number(productResult[0].total_operator_share),
        clinicShare: productClinicShare,
      },
      expenses: totalExpenses,
      grandTotal: {
        totalAmount: grandTotalAmount,
        totalDiscount: grandTotalDiscount,
        totalEmployeeShare: grandEmployeeShare,
        totalClinicShare: grandClinicShare,
        productClinicShare: productClinicShare,
        totalExpenses: totalExpenses,
        netClinicRevenue: grandClinicShare + productClinicShare - totalExpenses,
      },
      availablePeriods: periods.map((p) => p.period),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
