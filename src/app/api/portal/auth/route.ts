import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// POST /api/portal/auth — client login
export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const rows = await sql`SELECT id, name, email, phone, password_hash, active FROM clients WHERE email = ${email}`;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const client = rows[0];

    if (!client.active) {
      return NextResponse.json({ error: "Account is disabled. Please contact the clinic." }, { status: 403 });
    }

    if (!client.password_hash) {
      return NextResponse.json({ error: "Please set up your password first. Check your email for the setup link." }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, client.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await sql`INSERT INTO client_sessions (token, client_id, expires_at)
      VALUES (${token}, ${client.id}, ${expiresAt})`;

    return NextResponse.json({
      token,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/portal/auth — validate client session
export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const token = request.headers.get("x-client-token");

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const rows = await sql`
      SELECT s.client_id, s.expires_at, c.name, c.email, c.phone
      FROM client_sessions s
      JOIN clients c ON s.client_id = c.id
      WHERE s.token = ${token} AND c.active = true
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const session = rows[0];
    if (new Date(session.expires_at) < new Date()) {
      await sql`DELETE FROM client_sessions WHERE token = ${token}`;
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    return NextResponse.json({
      client: {
        id: session.client_id,
        name: session.name,
        email: session.email,
        phone: session.phone,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/portal/auth — client logout
export async function DELETE(request: NextRequest) {
  try {
    const sql = getDb();
    const token = request.headers.get("x-client-token");
    if (token) {
      await sql`DELETE FROM client_sessions WHERE token = ${token}`;
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
