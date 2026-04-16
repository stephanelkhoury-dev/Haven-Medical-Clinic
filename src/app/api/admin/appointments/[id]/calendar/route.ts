import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { generateICS } from "@/lib/calendar";

// GET /api/admin/appointments/[id]/calendar — download .ics file
// No auth required so email links work without login
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();

    const rows = await sql`
      SELECT id, name, service, date, time, notes
      FROM appointments WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const apt = rows[0];
    const ics = generateICS({
      id: apt.id,
      service: apt.service,
      date: apt.date,
      time: apt.time,
      name: apt.name,
      notes: apt.notes || "",
    });

    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="haven-appointment.ics"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
