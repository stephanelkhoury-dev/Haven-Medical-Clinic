import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await request.json();
    await sql`UPDATE campaigns SET
      subject = ${body.subject},
      status = ${body.status || "draft"},
      scheduled_at = ${body.scheduledAt || null},
      sent_at = ${body.sentAt || null},
      recipients = ${body.recipients || 0},
      open_rate = ${body.openRate ?? null},
      click_rate = ${body.clickRate ?? null},
      content = ${body.content || ""}
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
    await sql`DELETE FROM campaigns WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
