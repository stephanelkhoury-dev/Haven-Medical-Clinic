import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { logActivity, getRequestUser } from "@/lib/activity";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await request.json();
    await sql`UPDATE subscribers SET
      email = ${body.email},
      name = ${body.name || ""},
      status = ${body.status || "active"},
      source = ${body.source || "manual"}
      WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM subscribers WHERE id = ${id}`;
    const u = await getRequestUser(_request);
    if (u) logActivity({ userId: u.id, userName: u.name, userRole: u.role, action: "deleted", entityType: "subscriber", entityId: id, details: `Removed subscriber ${id}` });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
