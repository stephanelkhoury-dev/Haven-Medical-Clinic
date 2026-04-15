import { getDb } from "@/lib/db";
import { sendClientResetEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

// POST /api/portal/forgot-password — request password reset
export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const rows = await sql`SELECT id, name, email FROM clients WHERE email = ${email} AND active = true`;

    if (rows.length > 0) {
      const client = rows[0];
      const resetToken = crypto.randomUUID();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      await sql`UPDATE clients SET reset_token = ${resetToken}, reset_token_expires = ${resetExpires} WHERE id = ${client.id}`;

      try {
        await sendClientResetEmail(client.email, client.name, resetToken);
      } catch (emailErr) {
        console.error("Failed to send reset email:", emailErr);
      }
    }

    return NextResponse.json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
