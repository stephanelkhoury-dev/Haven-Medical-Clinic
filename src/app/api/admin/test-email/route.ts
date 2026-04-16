import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request, ["admin"]);
  if (isAuthError(user)) return user;

  const body = await request.json().catch(() => ({}));
  const to = body.to || process.env.SMTP_USER;

  const config = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER ? "SET" : "MISSING",
    pass: process.env.SMTP_PASS ? "SET" : "MISSING",
    from: process.env.SMTP_FROM || "NOT SET",
  };

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify connection first
    await transporter.verify();

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: "Haven SMTP Test",
      text: "If you receive this, SMTP is working correctly on production.",
      html: "<p>If you receive this, <strong>SMTP is working correctly</strong> on production.</p>",
    });

    return NextResponse.json({
      success: true,
      config,
      messageId: info.messageId,
      response: info.response,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const code = error instanceof Error ? (error as NodeJS.ErrnoException).code : undefined;
    return NextResponse.json({
      success: false,
      config,
      error: message,
      code,
    }, { status: 500 });
  }
}
