import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";

const ALLOWED = ["admin", "finance"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request, ALLOWED);
    if (isAuthError(auth)) return auth;

    const { id } = await params;
    const sql = getDb();
    const rows = await sql`SELECT * FROM acc_employees WHERE id = ${id}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    const r = rows[0];
    return NextResponse.json({
      id: r.id,
      name: r.name,
      role: r.role,
      specialty: r.specialty,
      splitRules: r.split_rules,
      sortOrder: r.sort_order,
      active: r.active,
      createdAt: r.created_at,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request, ALLOWED);
    if (isAuthError(auth)) return auth;

    const { id } = await params;
    const sql = getDb();
    const body = await request.json();

    await sql`UPDATE acc_employees SET
      name = ${body.name},
      role = ${body.role || ''},
      specialty = ${body.specialty || ''},
      split_rules = ${JSON.stringify(body.splitRules || [])},
      sort_order = ${body.sortOrder || 0},
      active = ${body.active !== false}
    WHERE id = ${id}`;

    return NextResponse.json({ id, ...body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request, ALLOWED);
    if (isAuthError(auth)) return auth;

    const { id } = await params;
    const sql = getDb();
    await sql`DELETE FROM acc_entries WHERE employee_id = ${id}`;
    await sql`DELETE FROM acc_employees WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
