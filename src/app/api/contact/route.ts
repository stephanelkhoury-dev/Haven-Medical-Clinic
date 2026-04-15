import { NextRequest, NextResponse } from "next/server";
import { sendContactNotification, sendContactAutoReply } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Name, email, subject, and message are required" }, { status: 400 });
    }

    // Send notification to clinic + auto-reply to sender (non-blocking)
    await Promise.all([
      sendContactNotification({ name, email, phone: phone || "", subject, message }),
      sendContactAutoReply(email, name),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
