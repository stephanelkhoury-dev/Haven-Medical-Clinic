import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";
import { sendAppointmentReminder } from "@/lib/email";
import { logActivity, createNotification } from "@/lib/activity";

// POST — send reminder for a specific appointment (email and/or whatsapp)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request, ["admin", "front_desk"]);
    if (isAuthError(auth)) return auth;

    const body = await request.json();
    const { appointmentId, method } = body; // method: "email" | "whatsapp" | "both"

    if (!appointmentId) {
      return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 });
    }

    const sql = getDb();
    const rows = await sql`SELECT * FROM appointments WHERE id = ${appointmentId}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const apt = rows[0];
    const results: { email?: boolean; whatsapp?: string } = {};

    // Send email reminder
    if ((method === "email" || method === "both") && apt.email) {
      try {
        await sendAppointmentReminder(apt.email, apt.name, {
          service: apt.service,
          date: apt.date,
          time: apt.time || "",
        }, apt.id);
        results.email = true;
      } catch {
        results.email = false;
      }
    }

    // Generate WhatsApp link (opened by the frontend)
    if (method === "whatsapp" || method === "both") {
      const phone = (apt.phone || "").replace(/[^0-9+]/g, "");
      if (phone) {
        const msg = encodeURIComponent(
          `Hello ${apt.name},\n\nThis is a friendly reminder about your appointment at Haven Medical & Beauty Clinic.\n\n` +
          `📋 Service: ${apt.service}\n📅 Date: ${apt.date}\n🕐 Time: ${apt.time || "TBD"}\n\n` +
          `Please arrive 10 minutes early. If you need to reschedule, please let us know.\n\nThank you!\nHaven Medical & Beauty Clinic`
        );
        results.whatsapp = `https://wa.me/${phone.replace("+", "")}?text=${msg}`;
      }
    }

    // Log the activity
    await logActivity({
      userId: auth.id,
      userName: auth.name,
      userRole: auth.role,
      action: "sent_reminder",
      entityType: "appointment",
      entityId: appointmentId,
      details: `Sent ${method} reminder to ${apt.name} for ${apt.service} on ${apt.date}`,
    });

    return NextResponse.json({ success: true, ...results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
