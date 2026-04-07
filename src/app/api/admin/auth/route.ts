import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// POST /api/admin/auth  — login
export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, username, name, role, active FROM admin_users
      WHERE username = ${username} AND password_hash = ${password} AND active = true
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const user = rows[0];
    // Generate a session token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

    await sql`INSERT INTO admin_sessions (token, user_id, expires_at)
      VALUES (${token}, ${user.id}, ${expiresAt})`;

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/auth  — logout
export async function DELETE(request: NextRequest) {
  try {
    const sql = getDb();
    const token = request.headers.get("x-auth-token");
    if (token) {
      await sql`DELETE FROM admin_sessions WHERE token = ${token}`;
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/admin/auth  — validate session
export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const token = request.headers.get("x-auth-token");

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const rows = await sql`
      SELECT s.user_id, s.expires_at, u.username, u.name, u.role
      FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.token = ${token} AND u.active = true
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const session = rows[0];
    if (new Date(session.expires_at) < new Date()) {
      await sql`DELETE FROM admin_sessions WHERE token = ${token}`;
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: session.user_id,
        username: session.username,
        name: session.name,
        role: session.role,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
