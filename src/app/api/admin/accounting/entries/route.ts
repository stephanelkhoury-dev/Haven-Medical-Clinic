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
      rows = await sql`SELECT e.*, emp.name as employee_name FROM acc_entries e
        JOIN acc_employees emp ON e.employee_id = emp.id
        WHERE e.period = ${period} AND e.employee_id = ${employeeId}
        ORDER BY e.date DESC`;
    } else if (period) {
      rows = await sql`SELECT e.*, emp.name as employee_name FROM acc_entries e
        JOIN acc_employees emp ON e.employee_id = emp.id
        WHERE e.period = ${period}
        ORDER BY e.date DESC`;
    } else if (employeeId) {
      rows = await sql`SELECT e.*, emp.name as employee_name FROM acc_entries e
        JOIN acc_employees emp ON e.employee_id = emp.id
        WHERE e.employee_id = ${employeeId}
        ORDER BY e.date DESC`;
    } else {
      rows = await sql`SELECT e.*, emp.name as employee_name FROM acc_entries e
        JOIN acc_employees emp ON e.employee_id = emp.id
        ORDER BY e.date DESC`;
    }

    const entries = rows.map((r) => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      date: r.date,
      serviceType: r.service_type,
      description: r.description,
      amount: r.amount,
      discount: r.discount,
      employeeShare: r.employee_share,
      clinicShare: r.clinic_share,
      period: r.period,
      createdAt: r.created_at,
      inAudit: r.in_audit !== false,
    }));
    return NextResponse.json(entries);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const date = body.date || now.slice(0, 10);
    const period = date.slice(0, 7); // YYYY-MM

    // Calculate shares based on employee split rules
    const empRows = await sql`SELECT split_rules FROM acc_employees WHERE id = ${body.employeeId}`;
    if (empRows.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const splitRules = empRows[0].split_rules as Array<{
      serviceType: string;
      employeePercent: number;
      clinicPercent: number;
    }>;

    const rule = splitRules.find((r) => r.serviceType === body.serviceType) ||
                 splitRules.find((r) => r.serviceType === "all");

    const amount = Number(body.amount) || 0;
    const discount = Number(body.discount) || 0;
    const net = amount - discount;

    let employeeShare = 0;
    let clinicShare = net;

    if (rule) {
      employeeShare = Math.round((amount * rule.employeePercent / 100) * 100) / 100;
      clinicShare = Math.round((net - employeeShare) * 100) / 100;
    }

    await sql`INSERT INTO acc_entries (id, employee_id, date, service_type, description, amount, discount, employee_share, clinic_share, period, created_at)
      VALUES (${id}, ${body.employeeId}, ${date}, ${body.serviceType || ''}, ${body.description || ''}, ${amount}, ${discount}, ${employeeShare}, ${clinicShare}, ${period}, ${now})`;

    return NextResponse.json({
      id,
      employeeId: body.employeeId,
      date,
      serviceType: body.serviceType,
      description: body.description,
      amount,
      discount,
      employeeShare,
      clinicShare,
      period,
      createdAt: now,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
