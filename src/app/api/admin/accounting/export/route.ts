import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";
import * as XLSX from "xlsx";

interface Entry {
  id: string;
  employee_name: string;
  date: string;
  service_type: string;
  description: string;
  amount: number;
  discount: number;
  employee_share: number;
  clinic_share: number;
  in_audit: boolean;
}

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  in_audit: boolean;
}

interface Product {
  id: string;
  date: string;
  product_type: string;
  description: string;
  amount: number;
  operator_name: string;
  operator_share: number;
  clinic_share: number;
  in_audit: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request, ["admin", "finance"]);
    if (isAuthError(auth)) return auth;

    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    const auditOnly = searchParams.get("audit_only") === "true";

    // Fetch all data for the period
    const auditFilter = auditOnly ? "AND COALESCE(in_audit, true) = true" : "";
    const auditFilterSimple = auditOnly ? "AND COALESCE(e.in_audit, true) = true" : "";

    const [entriesRaw, expensesRaw, productsRaw, employeesSummary] = await Promise.all([
      sql`SELECT e.*, emp.name as employee_name 
          FROM acc_entries e 
          JOIN acc_employees emp ON e.employee_id = emp.id 
          WHERE e.period = ${period} ${auditOnly ? sql`AND COALESCE(e.in_audit, true) = true` : sql``}
          ORDER BY e.date, emp.name`,
      sql`SELECT * FROM acc_expenses 
          WHERE period = ${period} ${auditOnly ? sql`AND COALESCE(in_audit, true) = true` : sql``}
          ORDER BY date`,
      sql`SELECT * FROM acc_products 
          WHERE period = ${period} ${auditOnly ? sql`AND COALESCE(in_audit, true) = true` : sql``}
          ORDER BY date`,
      sql`SELECT emp.name, emp.specialty,
            COALESCE(SUM(e.amount), 0) as total_amount,
            COALESCE(SUM(e.discount), 0) as total_discount,
            COALESCE(SUM(e.employee_share), 0) as total_employee_share,
            COALESCE(SUM(e.clinic_share), 0) as total_clinic_share,
            COUNT(e.id) as entry_count
          FROM acc_employees emp
          LEFT JOIN acc_entries e ON emp.id = e.employee_id 
            AND e.period = ${period} ${auditOnly ? sql`AND COALESCE(e.in_audit, true) = true` : sql``}
          WHERE emp.active = true
          GROUP BY emp.id, emp.name, emp.specialty
          ORDER BY emp.sort_order`,
    ]);

    const entries = entriesRaw as Entry[];
    const expenses = expensesRaw as Expense[];
    const products = productsRaw as Product[];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Summary ─────────────────────────────────────────────────
    const totalRevenue = entries.reduce((s, e) => s + Number(e.amount), 0);
    const totalDiscount = entries.reduce((s, e) => s + Number(e.discount), 0);
    const totalEmployeeShare = entries.reduce((s, e) => s + Number(e.employee_share), 0);
    const totalClinicShare = entries.reduce((s, e) => s + Number(e.clinic_share), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const productClinicShare = products.reduce((s, p) => s + Number(p.clinic_share), 0);
    const netRevenue = totalClinicShare + productClinicShare - totalExpenses;

    const summaryData = [
      ["Haven Beauty Clinic - Financial Report"],
      [`Period: ${new Date(period + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [auditOnly ? "Audit Report (Marked Items Only)" : "Full Report"],
      [],
      ["SUMMARY", ""],
      ["Total Revenue", totalRevenue],
      ["Total Discounts", totalDiscount],
      ["Net After Discounts", totalRevenue - totalDiscount],
      [],
      ["Employee Payouts", totalEmployeeShare],
      ["Clinic Share (Services)", totalClinicShare],
      ["Product Sales (Clinic Share)", productClinicShare],
      ["Total Expenses", totalExpenses],
      [],
      ["NET CLINIC REVENUE", netRevenue],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // ── Sheet 2: Employee Breakdown ──────────────────────────────────────
    const empData = [
      ["Employee", "Specialty", "Entries", "Revenue", "Discounts", "Employee Share", "Clinic Share"],
      ...employeesSummary.map((e) => [
        e.name,
        e.specialty,
        Number(e.entry_count),
        Number(e.total_amount),
        Number(e.total_discount),
        Number(e.total_employee_share),
        Number(e.total_clinic_share),
      ]),
      [],
      ["TOTAL", "", entries.length, totalRevenue, totalDiscount, totalEmployeeShare, totalClinicShare],
    ];
    const empSheet = XLSX.utils.aoa_to_sheet(empData);
    empSheet["!cols"] = [{ wch: 18 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, empSheet, "Employee Summary");

    // ── Sheet 3: All Entries ─────────────────────────────────────────────
    const entriesData = [
      ["Date", "Employee", "Service", "Description", "Amount", "Discount", "Employee Share", "Clinic Share", "In Audit"],
      ...entries.map((e) => [
        e.date,
        e.employee_name,
        e.service_type || "general",
        e.description || "",
        Number(e.amount),
        Number(e.discount),
        Number(e.employee_share),
        Number(e.clinic_share),
        e.in_audit !== false ? "Yes" : "No",
      ]),
    ];
    const entriesSheet = XLSX.utils.aoa_to_sheet(entriesData);
    entriesSheet["!cols"] = [
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
      { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, entriesSheet, "Entries");

    // ── Sheet 4: Expenses ────────────────────────────────────────────────
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + Number(e.amount);
    });

    const expensesData = [
      ["Date", "Category", "Description", "Amount", "In Audit"],
      ...expenses.map((e) => [
        e.date,
        e.category,
        e.description || "",
        Number(e.amount),
        e.in_audit !== false ? "Yes" : "No",
      ]),
      [],
      ["BY CATEGORY", "", "", ""],
      ...Object.entries(expensesByCategory).map(([cat, amt]) => ["", cat, "", amt, ""]),
      ["", "TOTAL", "", totalExpenses, ""],
    ];
    const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
    expensesSheet["!cols"] = [{ wch: 12 }, { wch: 15 }, { wch: 35 }, { wch: 12 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, expensesSheet, "Expenses");

    // ── Sheet 5: Products ────────────────────────────────────────────────
    const productsData = [
      ["Date", "Type", "Description", "Operator", "Amount", "Operator Share", "Clinic Share", "In Audit"],
      ...products.map((p) => [
        p.date,
        p.product_type,
        p.description || "",
        p.operator_name,
        Number(p.amount),
        Number(p.operator_share),
        Number(p.clinic_share),
        p.in_audit !== false ? "Yes" : "No",
      ]),
    ];
    const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
    productsSheet["!cols"] = [
      { wch: 12 }, { wch: 10 }, { wch: 25 }, { wch: 15 },
      { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, productsSheet, "Products");

    // Generate Excel file
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const filename = `haven-accounting-${period}${auditOnly ? "-audit" : ""}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
