import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { sendAppointmentConfirmation } from "@/lib/email";
import { logActivity, getRequestUser, createNotification } from "@/lib/activity";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT a.*, c.name as client_name_ref FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      ORDER BY a.created_at DESC`;
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
      clientId: r.client_id || "",
      employeeId: r.employee_id || "",
      employeeName: r.employee_name || "",
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
    await sql`INSERT INTO appointments (id, name, phone, email, service, date, time, status, created_at, notes, client_id, employee_id, employee_name)
      VALUES (${id}, ${body.name}, ${body.phone || ""}, ${body.email || ""}, ${body.service}, ${body.date || ""}, ${body.time || ""}, ${body.status || "pending"}, ${body.createdAt || new Date().toISOString().split("T")[0]}, ${body.notes || ""}, ${body.clientId || ""}, ${body.employeeId || ""}, ${body.employeeName || ""})`;

    // Send confirmation email if email provided and status is confirmed
    if (body.email && (body.status === "confirmed")) {
      sendAppointmentConfirmation(body.email, body.name, {
        service: body.service, date: body.date || "", time: body.time || "",
      }, id).catch(() => {});
    }

    // Log activity
    const u = await getRequestUser(request);
    if (u) {
      logActivity({ userId: u.id, userName: u.name, userRole: u.role, action: "created", entityType: "appointment", entityId: id, details: `Created appointment for ${body.name} — ${body.service} on ${body.date}` });
    }
    createNotification({ roleTarget: "front_desk", title: "New Appointment", message: `${body.name} — ${body.service} on ${body.date}`, type: "info", link: "/admin/appointments" });

    return NextResponse.json({ id, ...body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
