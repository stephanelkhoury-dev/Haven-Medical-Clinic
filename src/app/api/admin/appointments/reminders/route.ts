import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { sendAppointmentReminder } from "@/lib/email";

// GET /api/admin/appointments/reminders — Send reminders for tomorrow's appointments
// Can be triggered by a daily cron job or manually from admin
export async function POST(request: NextRequest) {
  try {
    // Simple auth check via header
    const authToken = request.headers.get("x-auth-token");
    const cronSecret = request.headers.get("x-cron-secret");
    if (!authToken && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getDb();

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Find confirmed appointments for tomorrow with email
    const appointments = await sql`
      SELECT * FROM appointments 
      WHERE date = ${tomorrowStr} 
        AND status = 'confirmed' 
        AND email != '' 
        AND email IS NOT NULL
    `;

    let sent = 0;
    for (const apt of appointments) {
      try {
        await sendAppointmentReminder(apt.email, apt.name, {
          service: apt.service,
          date: apt.date,
          time: apt.time || "",
        }, apt.id);
        sent++;
      } catch {
        // Skip failed sends
      }
    }

    return NextResponse.json({ success: true, sent, total: appointments.length, date: tomorrowStr });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
