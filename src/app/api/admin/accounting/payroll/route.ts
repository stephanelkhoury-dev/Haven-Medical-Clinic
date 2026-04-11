import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period");
    const employeeId = searchParams.get("employee_id");

    let rows;
    if (period && employeeId) {
      rows = await sql`
        SELECT p.*, e.name as employee_name, e.specialty 
        FROM acc_payroll p 
        JOIN acc_employees e ON p.employee_id = e.id 
        WHERE p.period = ${period} AND p.employee_id = ${employeeId}
        ORDER BY e.sort_order`;
    } else if (period) {
      rows = await sql`
        SELECT p.*, e.name as employee_name, e.specialty 
        FROM acc_payroll p 
        JOIN acc_employees e ON p.employee_id = e.id 
        WHERE p.period = ${period}
        ORDER BY e.sort_order`;
    } else if (employeeId) {
      rows = await sql`
        SELECT p.*, e.name as employee_name, e.specialty 
        FROM acc_payroll p 
        JOIN acc_employees e ON p.employee_id = e.id 
        WHERE p.employee_id = ${employeeId}
        ORDER BY p.period DESC`;
    } else {
      rows = await sql`
        SELECT p.*, e.name as employee_name, e.specialty 
        FROM acc_payroll p 
        JOIN acc_employees e ON p.employee_id = e.id 
        ORDER BY p.period DESC, e.sort_order`;
    }

    const payroll = rows.map((r) => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      specialty: r.specialty,
      period: r.period,
      grossAmount: r.gross_amount,
      paidAmount: r.paid_amount,
      paidDate: r.paid_date,
      status: r.status,
      notes: r.notes,
      createdAt: r.created_at,
    }));
    return NextResponse.json(payroll);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Generate payroll records from entries for a period
export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const period = body.period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    const now = new Date().toISOString();

    // Get employee earnings for the period
    const earnings = await sql`
      SELECT 
        e.employee_id,
        COALESCE(SUM(e.employee_share), 0) as total_earnings
      FROM acc_entries e
      WHERE e.period = ${period}
      GROUP BY e.employee_id`;

    // Check existing payroll records
    const existing = await sql`SELECT employee_id FROM acc_payroll WHERE period = ${period}`;
    const existingIds = new Set(existing.map(e => e.employee_id));

    let created = 0;
    let updated = 0;

    for (const e of earnings) {
      if (existingIds.has(e.employee_id)) {
        // Update existing
        await sql`
          UPDATE acc_payroll 
          SET gross_amount = ${Number(e.total_earnings)}
          WHERE period = ${period} AND employee_id = ${e.employee_id}`;
        updated++;
      } else {
        // Create new
        const id = crypto.randomUUID();
        await sql`
          INSERT INTO acc_payroll (id, employee_id, period, gross_amount, paid_amount, status, created_at)
          VALUES (${id}, ${e.employee_id}, ${period}, ${Number(e.total_earnings)}, 0, 'pending', ${now})`;
        created++;
      }
    }

    return NextResponse.json({ 
      message: `Created ${created}, updated ${updated} payroll records`, 
      created, 
      updated,
      period 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Mark payroll as paid
export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { id, paidAmount, paidDate, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing payroll id" }, { status: 400 });
    }

    const date = paidDate || new Date().toISOString().slice(0, 10);
    const status = paidAmount > 0 ? "paid" : "pending";

    await sql`
      UPDATE acc_payroll 
      SET paid_amount = ${Number(paidAmount) || 0},
          paid_date = ${date},
          status = ${status},
          notes = ${notes || ''}
      WHERE id = ${id}`;

    return NextResponse.json({ success: true, id, status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
