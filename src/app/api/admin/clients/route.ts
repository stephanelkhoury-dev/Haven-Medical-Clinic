import { getDb } from "@/lib/db";
import { sendClientSetupEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { logActivity, getRequestUser, createNotification } from "@/lib/activity";

// GET /api/admin/clients — list all clients
export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let rows;
    if (search) {
      const q = `%${search}%`;
      rows = await sql`SELECT id, name, email, phone, date_of_birth, gender, address, notes, active, created_at
        FROM clients WHERE name ILIKE ${q} OR email ILIKE ${q} OR phone ILIKE ${q}
        ORDER BY created_at DESC`;
    } else {
      rows = await sql`SELECT id, name, email, phone, date_of_birth, gender, address, notes, active, created_at
        FROM clients ORDER BY created_at DESC`;
    }

    const clients = rows.map((r) => ({
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
    }));
    return NextResponse.json(clients);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/clients — create a new client & send setup email
export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Check for duplicate email
    const existing = await sql`SELECT id FROM clients WHERE email = ${body.email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "A client with this email already exists" }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const setupToken = crypto.randomUUID();
    const setupExpires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48h

    await sql`INSERT INTO clients (id, name, email, phone, date_of_birth, gender, address, notes, setup_token, setup_token_expires, active, created_at)
      VALUES (${id}, ${body.name}, ${body.email}, ${body.phone || ""}, ${body.dateOfBirth || ""}, ${body.gender || ""}, ${body.address || ""}, ${body.notes || ""}, ${setupToken}, ${setupExpires}, true, ${now})`;

    // Send setup email (async, don't block response on failure)
    try {
      await sendClientSetupEmail(body.email, body.name, setupToken);
    } catch (emailErr) {
      console.error("Failed to send setup email:", emailErr);
    }

    // Log activity
    const u = await getRequestUser(request);
    if (u) logActivity({ userId: u.id, userName: u.name, userRole: u.role, action: "created", entityType: "client", entityId: id, details: `Created client: ${body.name} (${body.email})` });
    createNotification({ roleTarget: "admin", title: "New Client", message: `${body.name} was added`, type: "success", link: "/admin/clients" });

    return NextResponse.json({
      id,
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      dateOfBirth: body.dateOfBirth || "",
      gender: body.gender || "",
      address: body.address || "",
      notes: body.notes || "",
      active: true,
      createdAt: now,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
