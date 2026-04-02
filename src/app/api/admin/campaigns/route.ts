import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM campaigns ORDER BY COALESCE(sent_at, scheduled_at, id) DESC`;
    const campaigns = rows.map((r) => ({
      id: r.id,
      subject: r.subject,
      status: r.status,
      scheduledAt: r.scheduled_at || "",
      sentAt: r.sent_at || "",
      recipients: r.recipients || 0,
      openRate: r.open_rate,
      clickRate: r.click_rate,
      content: r.content || "",
    }));
    return NextResponse.json(campaigns);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const id = crypto.randomUUID();
    await sql`INSERT INTO campaigns (id, subject, status, scheduled_at, sent_at, recipients, open_rate, click_rate, content)
      VALUES (${id}, ${body.subject}, ${body.status || "draft"}, ${body.scheduledAt || null}, ${body.sentAt || null}, ${body.recipients || 0}, ${body.openRate ?? null}, ${body.clickRate ?? null}, ${body.content || ""})`;
    return NextResponse.json({ id, ...body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
