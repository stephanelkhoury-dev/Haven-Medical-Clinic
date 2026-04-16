import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";

// GET — fetch notifications for the current user (by user ID or role)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    const sql = getDb();
    const rows = await sql`
      SELECT * FROM notifications
      WHERE (user_id = ${auth.id} OR role_target = ${auth.role} OR role_target = '')
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return NextResponse.json(rows.map(r => ({
      id: r.id,
      title: r.title,
      message: r.message,
      type: r.type,
      link: r.link,
      read: r.read,
      createdAt: r.created_at,
    })));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT — mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    const sql = getDb();
    const body = await request.json();

    if (body.markAllRead) {
      await sql`UPDATE notifications SET read = true
        WHERE (user_id = ${auth.id} OR role_target = ${auth.role} OR role_target = '') AND read = false`;
    } else if (body.id) {
      await sql`UPDATE notifications SET read = true WHERE id = ${body.id}`;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
