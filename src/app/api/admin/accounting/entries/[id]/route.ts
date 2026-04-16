import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { logActivity, getRequestUser } from "@/lib/activity";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();
    const body = await request.json();
    const date = body.date;
    const period = date?.slice(0, 7) || '';

    // Recalculate shares
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

    await sql`UPDATE acc_entries SET
      employee_id = ${body.employeeId},
      date = ${date},
      service_type = ${body.serviceType || ''},
      description = ${body.description || ''},
      amount = ${amount},
      discount = ${discount},
      employee_share = ${employeeShare},
      clinic_share = ${clinicShare},
      period = ${period}
    WHERE id = ${id}`;

    const u = await getRequestUser(request);
    if (u) logActivity({ userId: u.id, userName: u.name, userRole: u.role, action: "updated", entityType: "entry", entityId: id, details: `Updated entry: $${amount} — ${body.description || body.serviceType}` });

    return NextResponse.json({ id, employeeShare, clinicShare, ...body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();
    await sql`DELETE FROM acc_entries WHERE id = ${id}`;
    const u = await getRequestUser(_request);
    if (u) logActivity({ userId: u.id, userName: u.name, userRole: u.role, action: "deleted", entityType: "entry", entityId: id, details: `Deleted entry ${id}` });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
