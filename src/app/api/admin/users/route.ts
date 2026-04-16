import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";

// Helper: verify admin role from token
async function verifyAdmin(request: NextRequest) {
  const sql = getDb();
  const token = request.headers.get("x-auth-token");
  if (!token) return null;

  const rows = await sql`
    SELECT u.id, u.role FROM admin_sessions s
    JOIN admin_users u ON s.user_id = u.id
    WHERE s.token = ${token} AND u.active = true AND s.expires_at > NOW()
  `;
  if (rows.length === 0) return null;
  return rows[0];
}

// GET /api/admin/users — list all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const caller = await verifyAdmin(request);
    if (!caller || caller.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const sql = getDb();
    const rows = await sql`SELECT id, username, name, role, active, created_at FROM admin_users ORDER BY created_at ASC`;
    const users = rows.map((r) => ({
      id: r.id,
      username: r.username,
      name: r.name,
      role: r.role,
      active: r.active,
      createdAt: r.created_at,
    }));
    return NextResponse.json(users);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/users — create a user (admin only)
export async function POST(request: NextRequest) {
  try {
    const caller = await verifyAdmin(request);
    if (!caller || caller.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const sql = getDb();
    const body = await request.json();

    if (!body.username || !body.password || !body.name || !body.role) {
      return NextResponse.json({ error: "Username, password, name, and role are required" }, { status: 400 });
    }

    const validRoles = ["admin", "finance", "editor", "front_desk"];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }, { status: 400 });
    }

    // Check duplicate username
    const existing = await sql`SELECT id FROM admin_users WHERE username = ${body.username}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await sql`INSERT INTO admin_users (id, username, password_hash, name, role, active, created_at)
      VALUES (${id}, ${body.username}, ${body.password}, ${body.name}, ${body.role}, true, ${now})`;

    logActivity({ userId: caller.id as string, userName: "admin", userRole: caller.role as string, action: "created", entityType: "user", entityId: id, details: `Created user: ${body.username} (${body.role})` });

    return NextResponse.json({ id, username: body.username, name: body.name, role: body.role, active: true, createdAt: now });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
