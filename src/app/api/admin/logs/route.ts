import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";

// GET — fetch activity logs (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request, ["admin"]);
    if (isAuthError(auth)) return auth;

    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const entityType = searchParams.get("entity_type");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let rows;
    if (userId && entityType) {
      rows = await sql`SELECT * FROM activity_logs WHERE user_id = ${userId} AND entity_type = ${entityType} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    } else if (userId) {
      rows = await sql`SELECT * FROM activity_logs WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    } else if (entityType) {
      rows = await sql`SELECT * FROM activity_logs WHERE entity_type = ${entityType} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    } else {
      rows = await sql`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    }

    return NextResponse.json(rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userRole: r.user_role,
      action: r.action,
      entityType: r.entity_type,
      entityId: r.entity_id,
      details: r.details,
      createdAt: r.created_at,
    })));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
