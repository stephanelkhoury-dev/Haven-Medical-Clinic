import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { sendNewsletterWelcome } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await sql`SELECT id, status FROM subscribers WHERE email = ${email}`;
    if (existing.length > 0) {
      if (existing[0].status === "unsubscribed") {
        await sql`UPDATE subscribers SET status = 'active' WHERE id = ${existing[0].id}`;
      }
      return NextResponse.json({ success: true });
    }

    const id = crypto.randomUUID();
    await sql`INSERT INTO subscribers (id, email, name, subscribed_at, status, source)
      VALUES (${id}, ${email}, ${body.name || ""}, ${new Date().toISOString().split("T")[0]}, 'active', ${body.source || "website"})`;

    // Send welcome email (non-blocking)
    sendNewsletterWelcome(email, id).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
