import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// POST /api/portal/setup — set password using setup token
export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const rows = await sql`SELECT id, name, email, setup_token_expires FROM clients
      WHERE setup_token = ${token} AND active = true`;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid or expired setup link" }, { status: 400 });
    }

    const client = rows[0];

    if (client.setup_token_expires && new Date(client.setup_token_expires) < new Date()) {
      return NextResponse.json({ error: "Setup link has expired. Please contact the clinic for a new one." }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);

    await sql`UPDATE clients SET 
      password_hash = ${hash},
      setup_token = '',
      setup_token_expires = ''
    WHERE id = ${client.id}`;

    // Auto-login: create a session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await sql`INSERT INTO client_sessions (token, client_id, expires_at)
      VALUES (${sessionToken}, ${client.id}, ${expiresAt})`;

    return NextResponse.json({
      success: true,
      token: sessionToken,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
