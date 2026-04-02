import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM appointments ORDER BY created_at DESC`;
    // Transform snake_case to camelCase
    const appointments = rows.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      email: r.email || "",
      service: r.service,
      date: r.date,
      time: r.time,
      status: r.status,
      createdAt: r.created_at,
      notes: r.notes || "",
    }));
    return NextResponse.json(appointments);
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
    await sql`INSERT INTO appointments (id, name, phone, email, service, date, time, status, created_at, notes)
      VALUES (${id}, ${body.name}, ${body.phone || ""}, ${body.email || ""}, ${body.service}, ${body.date || ""}, ${body.time || ""}, ${body.status || "pending"}, ${body.createdAt || new Date().toISOString().split("T")[0]}, ${body.notes || ""})`;
    return NextResponse.json({ id, ...body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
