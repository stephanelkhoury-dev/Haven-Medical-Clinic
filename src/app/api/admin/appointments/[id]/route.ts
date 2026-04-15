import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { sendAppointmentStatusEmail } from "@/lib/email";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await request.json();

    // Get current appointment to detect status change
    const current = await sql`SELECT status, email FROM appointments WHERE id = ${id}`;
    const oldStatus = current[0]?.status;

    await sql`UPDATE appointments SET
      name = ${body.name},
      phone = ${body.phone || ""},
      email = ${body.email || ""},
      service = ${body.service},
      date = ${body.date || ""},
      time = ${body.time || ""},
      status = ${body.status || "pending"},
      notes = ${body.notes || ""},
      client_id = ${body.clientId || ""}
      WHERE id = ${id}`;

    // Send status change email if status changed and email exists
    const newStatus = body.status || "pending";
    const email = body.email || current[0]?.email;
    if (email && oldStatus !== newStatus && ["confirmed", "cancelled", "completed"].includes(newStatus)) {
      sendAppointmentStatusEmail(email, body.name, newStatus, {
        service: body.service, date: body.date || "", time: body.time || "",
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM appointments WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
