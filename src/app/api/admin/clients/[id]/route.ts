import { getDb } from "@/lib/db";
import { sendClientSetupEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/clients/[id]
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const rows = await sql`SELECT id, name, email, phone, date_of_birth, gender, address, notes, active, created_at
      FROM clients WHERE id = ${id}`;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const r = rows[0];

    // Also fetch appointment history
    const appointments = await sql`SELECT id, service, date, time, status, notes, created_at 
      FROM appointments WHERE client_id = ${id} ORDER BY date DESC`;

    return NextResponse.json({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      dateOfBirth: r.date_of_birth,
      gender: r.gender,
      address: r.address,
      notes: r.notes,
      active: r.active,
      createdAt: r.created_at,
      appointments: appointments.map((a) => ({
        id: a.id,
        service: a.service,
        date: a.date,
        time: a.time,
        status: a.status,
        notes: a.notes,
        createdAt: a.created_at,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/admin/clients/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await request.json();

    await sql`UPDATE clients SET
      name = ${body.name},
      email = ${body.email},
      phone = ${body.phone || ""},
      date_of_birth = ${body.dateOfBirth || ""},
      gender = ${body.gender || ""},
      address = ${body.address || ""},
      notes = ${body.notes || ""},
      active = ${body.active !== false}
    WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/clients/[id]
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM clients WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/clients/[id] — resend setup email
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;

    const rows = await sql`SELECT name, email FROM clients WHERE id = ${id}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const setupToken = crypto.randomUUID();
    const setupExpires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    await sql`UPDATE clients SET setup_token = ${setupToken}, setup_token_expires = ${setupExpires} WHERE id = ${id}`;

    await sendClientSetupEmail(rows[0].email, rows[0].name, setupToken);

    return NextResponse.json({ success: true, message: "Setup email sent" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
