import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM subscribers ORDER BY subscribed_at DESC`;
    const subscribers = rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      subscribedAt: r.subscribed_at,
      status: r.status,
      source: r.source,
    }));
    return NextResponse.json(subscribers);
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
    await sql`INSERT INTO subscribers (id, email, name, subscribed_at, status, source)
      VALUES (${id}, ${body.email}, ${body.name || ""}, ${body.subscribedAt || new Date().toISOString().split("T")[0]}, ${body.status || "active"}, ${body.source || "manual"})`;
    return NextResponse.json({ id, ...body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
