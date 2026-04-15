import nodemailer from "nodemailer";

// ── Transporter (lazy singleton) ─────────────────────────────────────
let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return _transporter;
}

const FROM = process.env.SMTP_FROM || "Haven Medical <havenmedicalcliniclb@gmail.com>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.haven-beautyclinic.com";

// ── Shared template wrapper ──────────────────────────────────────────
function emailWrapper(body: string, unsubscribeId?: string) {
  const unsub = unsubscribeId
    ? `<p style="text-align:center;margin-top:20px;"><a href="${BASE_URL}/unsubscribe?id=${encodeURIComponent(unsubscribeId)}" style="color:#aaa;font-size:11px;text-decoration:underline;">Unsubscribe</a></p>`
    : "";
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Haven<span style="color: #1fbda6;">Medical</span></h1>
      </div>
      ${body}
      <p style="color: #aaa; font-size: 12px; text-align: center;">
        &copy; ${new Date().getFullYear()} Haven Medical Clinic. All rights reserved.
      </p>
      ${unsub}
    </div>
  `;
}

// ── Send a generic email ─────────────────────────────────────────────
export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = getTransporter();
  await transporter.sendMail({ from: FROM, to, subject, html });
}

// ── Client account setup email ───────────────────────────────────────
export async function sendClientSetupEmail(email: string, name: string, token: string) {
  const link = `${BASE_URL}/portal/setup?token=${encodeURIComponent(token)}`;
  const html = emailWrapper(`
    <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: #1a1a2e; margin-top: 0;">Welcome, ${name}!</h2>
      <p style="color: #555; line-height: 1.6;">
        Your account has been created at Haven Medical Clinic. Please set up your password to access your patient portal where you can view your appointments and treatment history.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${link}" style="display: inline-block; background: #1fbda6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Set Up Your Password</a>
      </div>
      <p style="color: #888; font-size: 13px;">This link expires in 48 hours. If you did not expect this email, you can safely ignore it.</p>
    </div>
  `);
  await sendEmail(email, "Welcome to Haven Medical — Set Up Your Account", html);
}

// ── Password reset email ─────────────────────────────────────────────
export async function sendClientResetEmail(email: string, name: string, token: string) {
  const link = `${BASE_URL}/portal/reset-password?token=${encodeURIComponent(token)}`;
  const html = emailWrapper(`
    <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: #1a1a2e; margin-top: 0;">Password Reset</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${name}, we received a request to reset your password. Click the button below to choose a new password.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${link}" style="display: inline-block; background: #1fbda6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
      </div>
      <p style="color: #888; font-size: 13px;">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `);
  await sendEmail(email, "Haven Medical — Reset Your Password", html);
}

// ── Newsletter welcome email ─────────────────────────────────────────
export async function sendNewsletterWelcome(email: string, subscriberId: string) {
  const html = emailWrapper(`
    <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: #1a1a2e; margin-top: 0;">Thank You for Subscribing!</h2>
      <p style="color: #555; line-height: 1.6;">
        You're now part of the Haven Medical community. You'll receive exclusive offers, beauty tips, and the latest updates from our specialists.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${BASE_URL}" style="display: inline-block; background: #1fbda6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Visit Our Website</a>
      </div>
    </div>
  `, subscriberId);
  await sendEmail(email, "Welcome to Haven Medical Newsletter", html);
}

// ── Appointment confirmation email ───────────────────────────────────
export async function sendAppointmentConfirmation(email: string, name: string, details: { service: string; date: string; time: string }) {
  const html = emailWrapper(`
    <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: #1a1a2e; margin-top: 0;">Appointment Confirmed!</h2>
      <p style="color: #555; line-height: 1.6;">Hi ${name}, your appointment has been confirmed.</p>
      <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Service</td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600; text-align: right; font-size: 14px;">${details.service}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600; text-align: right; font-size: 14px;">${details.date}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Time</td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600; text-align: right; font-size: 14px;">${details.time}</td></tr>
        </table>
      </div>
      <p style="color: #888; font-size: 13px;">If you need to reschedule or cancel, please contact us at +961 71 888 930.</p>
    </div>
  `);
  await sendEmail(email, `Appointment Confirmed — ${details.service}`, html);
}

// ── Appointment status update email ──────────────────────────────────
export async function sendAppointmentStatusEmail(email: string, name: string, status: string, details: { service: string; date: string; time: string }) {
  const statusText: Record<string, { title: string; message: string; color: string }> = {
    confirmed: { title: "Appointment Confirmed", message: "Your appointment has been confirmed. We look forward to seeing you!", color: "#16a34a" },
    cancelled: { title: "Appointment Cancelled", message: "Your appointment has been cancelled. If this was a mistake, please contact us to reschedule.", color: "#dc2626" },
    completed: { title: "Thank You for Visiting!", message: "We hope you had a great experience at Haven Medical. We'd love to see you again!", color: "#1fbda6" },
  };
  const info = statusText[status];
  if (!info) return;

  const html = emailWrapper(`
    <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: ${info.color}; margin-top: 0;">${info.title}</h2>
      <p style="color: #555; line-height: 1.6;">Hi ${name}, ${info.message}</p>
      <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Service</td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600; text-align: right; font-size: 14px;">${details.service}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600; text-align: right; font-size: 14px;">${details.date}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Time</td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600; text-align: right; font-size: 14px;">${details.time}</td></tr>
        </table>
      </div>
      ${status === "completed" ? `<div style="text-align:center;margin:20px 0;"><a href="${BASE_URL}/appointment" style="display:inline-block;background:#1fbda6;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">Book Another Appointment</a></div>` : ""}
      <p style="color: #888; font-size: 13px;">Questions? Contact us at +961 71 888 930.</p>
    </div>
  `);
  await sendEmail(email, `Haven Medical — ${info.title}`, html);
}

// ── Appointment reminder email ───────────────────────────────────────
export async function sendAppointmentReminder(email: string, name: string, details: { service: string; date: string; time: string }) {
  const html = emailWrapper(`
    <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: #1a1a2e; margin-top: 0;">Appointment Reminder</h2>
      <p style="color: #555; line-height: 1.6;">Hi ${name}, this is a friendly reminder about your upcoming appointment at Haven Medical.</p>
      <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Service</td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600; text-align: right; font-size: 14px;">${details.service}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600; text-align: right; font-size: 14px;">${details.date}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Time</td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600; text-align: right; font-size: 14px;">${details.time}</td></tr>
        </table>
      </div>
      <p style="color: #888; font-size: 13px;">Need to reschedule? Contact us at +961 71 888 930.</p>
    </div>
  `);
  await sendEmail(email, `Reminder: ${details.service} — Tomorrow`, html);
}

// ── Contact form notification to clinic ──────────────────────────────
export async function sendContactNotification(data: { name: string; email: string; phone: string; subject: string; message: string }) {
  const html = emailWrapper(`
    <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: #1a1a2e; margin-top: 0;">New Contact Form Message</h2>
      <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px; width: 100px;">Name</td><td style="padding: 8px 0; color: #1a1a2e; font-size: 14px;">${data.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #1a1a2e; font-size: 14px;"><a href="mailto:${data.email}" style="color:#1fbda6;">${data.email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Phone</td><td style="padding: 8px 0; color: #1a1a2e; font-size: 14px;">${data.phone || "—"}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Subject</td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600; font-size: 14px;">${data.subject}</td></tr>
        </table>
        <div style="border-top: 1px solid #e5e7eb; margin-top: 12px; padding-top: 12px;">
          <p style="color: #888; font-size: 13px; margin-bottom: 6px;">Message:</p>
          <p style="color: #1a1a2e; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
        </div>
      </div>
    </div>
  `);
  await sendEmail(process.env.SMTP_USER || "havenmedicalcliniclb@gmail.com", `Contact Form: ${data.subject} — ${data.name}`, html);
}

// ── Contact form auto-reply ──────────────────────────────────────────
export async function sendContactAutoReply(email: string, name: string) {
  const html = emailWrapper(`
    <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: #1a1a2e; margin-top: 0;">We Received Your Message!</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${name}, thank you for contacting Haven Medical. We've received your message and our team will get back to you within 24 hours.
      </p>
      <p style="color: #555; line-height: 1.6;">In the meantime, feel free to:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${BASE_URL}/appointment" style="display: inline-block; background: #1fbda6; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 0 8px;">Book an Appointment</a>
      </div>
    </div>
  `);
  await sendEmail(email, "Haven Medical — We Received Your Message", html);
}

// ── Newsletter campaign email ────────────────────────────────────────
export async function sendCampaignEmail(email: string, subject: string, content: string, subscriberId: string) {
  const html = emailWrapper(`
    <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <div style="color: #333; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${content}</div>
    </div>
  `, subscriberId);
  await sendEmail(email, subject, html);
}
