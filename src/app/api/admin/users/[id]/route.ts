import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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

// PUT /api/admin/users/[id] — update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await verifyAdmin(request);
    if (!caller || caller.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const sql = getDb();
    const body = await request.json();

    const validRoles = ["admin", "finance", "editor", "front_desk"];
    if (body.role && !validRoles.includes(body.role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }, { status: 400 });
    }

    // If password provided, update it too
    if (body.password) {
      await sql`UPDATE admin_users SET
        name = ${body.name},
        role = ${body.role},
        active = ${body.active !== false},
        password_hash = ${body.password}
      WHERE id = ${id}`;
    } else {
      await sql`UPDATE admin_users SET
        name = ${body.name},
        role = ${body.role},
        active = ${body.active !== false}
      WHERE id = ${id}`;
    }

    // If deactivated, clear their sessions
    if (body.active === false) {
      await sql`DELETE FROM admin_sessions WHERE user_id = ${id}`;
    }

    return NextResponse.json({ id, ...body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] — delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await verifyAdmin(request);
    if (!caller || caller.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const sql = getDb();

    // Prevent deleting yourself
    if (caller.id === id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await sql`DELETE FROM admin_sessions WHERE user_id = ${id}`;
    await sql`DELETE FROM admin_users WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
