import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Helper to extract client from session
async function getClientFromSession(request: NextRequest) {
  const sql = getDb();
  const token = request.headers.get("x-client-token");
  if (!token) return null;

  const rows = await sql`
    SELECT s.client_id, c.name, c.email
    FROM client_sessions s
    JOIN clients c ON s.client_id = c.id
    WHERE s.token = ${token} AND c.active = true AND s.expires_at > ${new Date().toISOString()}
  `;
  return rows.length > 0 ? rows[0] : null;
}

// GET /api/portal/appointments — get client's appointments
export async function GET(request: NextRequest) {
  try {
    const client = await getClientFromSession(request);
    if (!client) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getDb();
    const rows = await sql`SELECT id, name, phone, email, service, date, time, status, notes, created_at
      FROM appointments WHERE client_id = ${client.client_id}
      ORDER BY date DESC, time DESC`;

    const appointments = rows.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      service: r.service,
      date: r.date,
      time: r.time,
      status: r.status,
      notes: r.notes,
      createdAt: r.created_at,
    }));

    return NextResponse.json(appointments);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
