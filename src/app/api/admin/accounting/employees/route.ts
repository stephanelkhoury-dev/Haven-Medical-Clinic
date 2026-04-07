import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM acc_employees ORDER BY sort_order ASC`;
    const employees = rows.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      specialty: r.specialty,
      splitRules: r.split_rules,
      sortOrder: r.sort_order,
      active: r.active,
      createdAt: r.created_at,
    }));
    return NextResponse.json(employees);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const id = `emp-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    await sql`INSERT INTO acc_employees (id, name, role, specialty, split_rules, sort_order, active, created_at)
      VALUES (${id}, ${body.name}, ${body.role || ''}, ${body.specialty || ''}, ${JSON.stringify(body.splitRules || [])}, ${body.sortOrder || 0}, ${body.active !== false}, ${now})`;

    return NextResponse.json({ id, ...body, createdAt: now });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
