import nodemailer from "nodemailer";
import { calendarEmailButtons } from "@/lib/calendar";

// ── Transporter (lazy singleton) ─────────────────────────────────────
let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: (process.env.SMTP_HOST || "smtp.gmail.com").trim(),
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: (process.env.SMTP_USER || "").trim(),
      pass: (process.env.SMTP_PASS || "").trim(),
    },
  });

  return _transporter;
}

const FROM = (process.env.SMTP_FROM || "Haven Medical <havenmedicalcliniclb@gmail.com>").trim();
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.haven-beautyclinic.com";
const LOGO_URL = `${BASE_URL}/images/email-logo.png`;
const PHONE = "+961 71 888 930";
const ADDRESS = "Beirut, Lebanon";

// ── Reusable components ──────────────────────────────────────────────

function ctaButton(href: string, label: string, color = "#1fbda6") {
  return `
    <div style="text-align:center;margin:32px 0 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="border-radius:8px;background:${color};">
            <a href="${href}" target="_blank"
              style="display:inline-block;padding:16px 40px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">
              ${label}
            </a>
          </td>
        </tr>
      </table>
    </div>`;
}

function detailsCard(rows: { label: string; value: string }[]) {
  const rowsHtml = rows.map(r => `
    <tr>
      <td style="padding:12px 16px;color:#7c8694;font-size:13px;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #f0f2f5;width:120px;">${r.label}</td>
      <td style="padding:12px 16px;color:#1a1a2e;font-weight:600;font-size:14px;text-align:right;border-bottom:1px solid #f0f2f5;">${r.value}</td>
    </tr>`).join("");
  return `
    <div style="margin:24px 0;">
      <table style="width:100%;border-collapse:collapse;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e8ecf1;">
        ${rowsHtml}
      </table>
    </div>`;
}

function iconCircle(emoji: string) {
  return `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;background:linear-gradient(135deg,#e6faf7 0%,#d0f5ef 100%);font-size:28px;text-align:center;">
        ${emoji}
      </div>
    </div>`;
}

// ── Shared template wrapper ──────────────────────────────────────────
function emailWrapper(body: string, unsubscribeId?: string) {
  const unsub = unsubscribeId
    ? `<tr><td style="padding:0 40px 24px;text-align:center;">
        <a href="${BASE_URL}/unsubscribe?id=${encodeURIComponent(unsubscribeId)}" style="color:#b0b7c3;font-size:11px;text-decoration:underline;">Unsubscribe from this list</a>
      </td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Haven Medical</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;-webkit-text-size-adjust:none;">

<!-- Outer wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;">
  <tr>
    <td align="center" style="padding:32px 16px;">

      <!-- Email container -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <!-- Logo banner -->
        <tr>
          <td style="text-align:center;background:#f0f8f7;padding:0;">
            <a href="${BASE_URL}" target="_blank" style="text-decoration:none;display:block;">
              <img src="${LOGO_URL}" alt="Haven Medical & Beauty Clinic" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;"/>
            </a>
          </td>
        </tr>

        <!-- Body content -->
        <tr>
          <td style="padding:32px 40px;font-family:'Helvetica Neue',Arial,sans-serif;color:#333;">
            ${body}
          </td>
        </tr>

        <!-- Footer divider -->
        <tr>
          <td style="padding:0 40px;">
            <div style="height:1px;background:linear-gradient(90deg,transparent 0%,#e8ecf1 20%,#e8ecf1 80%,transparent 100%);"></div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 40px 20px;text-align:center;background:#fafbfc;">
            <!-- Social links -->
            <div style="margin-bottom:16px;">
              <a href="https://www.instagram.com/haven_medical_clinic/" target="_blank" style="display:inline-block;margin:0 6px;text-decoration:none;">
                <img src="https://img.icons8.com/fluency/32/instagram-new.png" alt="Instagram" width="28" height="28" style="border:0;"/>
              </a>
              <a href="https://wa.me/96171888930" target="_blank" style="display:inline-block;margin:0 6px;text-decoration:none;">
                <img src="https://img.icons8.com/fluency/32/whatsapp.png" alt="WhatsApp" width="28" height="28" style="border:0;"/>
              </a>
              <a href="tel:+96171888930" style="display:inline-block;margin:0 6px;text-decoration:none;">
                <img src="https://img.icons8.com/fluency/32/phone.png" alt="Phone" width="28" height="28" style="border:0;"/>
              </a>
            </div>
            <!-- Contact info -->
            <p style="margin:0 0 6px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#7c8694;line-height:1.5;">
              Haven Medical &amp; Beauty Clinic &middot; ${ADDRESS}
            </p>
            <p style="margin:0 0 6px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#7c8694;">
              <a href="tel:${PHONE.replace(/\s/g, "")}" style="color:#1fbda6;text-decoration:none;">${PHONE}</a>
              &nbsp;&middot;&nbsp;
              <a href="${BASE_URL}" style="color:#1fbda6;text-decoration:none;">haven-beautyclinic.com</a>
            </p>
            <p style="margin:12px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#b0b7c3;">
              &copy; ${new Date().getFullYear()} Haven Medical Clinic. All rights reserved.
            </p>
          </td>
        </tr>

        ${unsub}

      </table>
      <!-- /Email container -->

    </td>
  </tr>
</table>
<!-- /Outer wrapper -->

</body>
</html>`;
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
    ${iconCircle("👋")}
    <h2 style="text-align:center;color:#1a1a2e;font-size:22px;font-weight:700;margin:0 0 8px;">Welcome, ${name}!</h2>
    <p style="text-align:center;color:#7c8694;font-size:14px;margin:0 0 24px;">Your patient account is ready</p>

    <p style="color:#4a5568;font-size:14px;line-height:1.7;">
      Your account has been created at <strong>Haven Medical Clinic</strong>. Set up your password to access the patient portal where you can view your appointments, treatment history, and more.
    </p>

    ${ctaButton(link, "Set Up Your Password")}

    <div style="background:#f7f8fa;border-radius:8px;padding:16px 20px;margin-top:8px;">
      <p style="color:#7c8694;font-size:12px;line-height:1.5;margin:0;">
        🔒 This link expires in <strong>48 hours</strong>. If you did not expect this email, you can safely ignore it.
      </p>
    </div>
  `);
  await sendEmail(email, "Welcome to Haven Medical — Set Up Your Account", html);
}

// ── Password reset email ─────────────────────────────────────────────
export async function sendClientResetEmail(email: string, name: string, token: string) {
  const link = `${BASE_URL}/portal/reset-password?token=${encodeURIComponent(token)}`;
  const html = emailWrapper(`
    ${iconCircle("🔐")}
    <h2 style="text-align:center;color:#1a1a2e;font-size:22px;font-weight:700;margin:0 0 8px;">Password Reset</h2>
    <p style="text-align:center;color:#7c8694;font-size:14px;margin:0 0 24px;">Secure your account with a new password</p>

    <p style="color:#4a5568;font-size:14px;line-height:1.7;">
      Hi <strong>${name}</strong>, we received a request to reset your password. Click the button below to choose a new password for your Haven Medical account.
    </p>

    ${ctaButton(link, "Reset Password")}

    <div style="background:#f7f8fa;border-radius:8px;padding:16px 20px;margin-top:8px;">
      <p style="color:#7c8694;font-size:12px;line-height:1.5;margin:0;">
        ⏱ This link expires in <strong>1 hour</strong>. If you did not request a password reset, your account is still secure — no action needed.
      </p>
    </div>
  `);
  await sendEmail(email, "Haven Medical — Reset Your Password", html);
}

// ── Newsletter welcome email ─────────────────────────────────────────
export async function sendNewsletterWelcome(email: string, subscriberId: string) {
  const html = emailWrapper(`
    ${iconCircle("💌")}
    <h2 style="text-align:center;color:#1a1a2e;font-size:22px;font-weight:700;margin:0 0 8px;">Thank You for Subscribing!</h2>
    <p style="text-align:center;color:#7c8694;font-size:14px;margin:0 0 28px;">You're now part of the Haven Medical community</p>

    <p style="color:#4a5568;font-size:14px;line-height:1.7;">
      We're excited to have you! You'll be the first to know about:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 8px;">
      <tr>
        <td style="padding:6px 0;color:#4a5568;font-size:14px;">✨&nbsp;&nbsp;Exclusive offers &amp; seasonal promotions</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#4a5568;font-size:14px;">💡&nbsp;&nbsp;Expert beauty &amp; skincare tips</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#4a5568;font-size:14px;">🆕&nbsp;&nbsp;New treatments &amp; services</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#4a5568;font-size:14px;">👩‍⚕️&nbsp;&nbsp;Specialist insights &amp; articles</td>
      </tr>
    </table>

    ${ctaButton(`${BASE_URL}/services`, "Explore Our Services")}
  `, subscriberId);
  await sendEmail(email, "Welcome to Haven Medical Newsletter ✨", html);
}

// ── Appointment confirmation email ───────────────────────────────────
export async function sendAppointmentConfirmation(email: string, name: string, details: { service: string; date: string; time: string }, appointmentId?: string) {
  const calendarBtns = appointmentId ? calendarEmailButtons(appointmentId, { id: appointmentId, name, ...details }) : "";
  const html = emailWrapper(`
    ${iconCircle("✅")}
    <h2 style="text-align:center;color:#16a34a;font-size:22px;font-weight:700;margin:0 0 8px;">Appointment Confirmed!</h2>
    <p style="text-align:center;color:#7c8694;font-size:14px;margin:0 0 24px;">We look forward to seeing you, ${name}</p>

    ${detailsCard([
      { label: "Service", value: details.service },
      { label: "Date", value: details.date },
      { label: "Time", value: details.time },
      { label: "Location", value: "Haven Medical Clinic" },
    ])}

    ${calendarBtns}

    <div style="background:#f0fdf4;border-radius:8px;padding:16px 20px;border-left:4px solid #16a34a;">
      <p style="color:#166534;font-size:13px;line-height:1.5;margin:0;">
        <strong>Preparation tip:</strong> Please arrive 10 minutes before your scheduled time. Bring any relevant medical records or prescriptions.
      </p>
    </div>

    <p style="color:#7c8694;font-size:13px;text-align:center;margin-top:24px;">
      Need to reschedule or cancel? Contact us at <a href="tel:${PHONE.replace(/\s/g, "")}" style="color:#1fbda6;text-decoration:none;">${PHONE}</a>
    </p>
  `);
  await sendEmail(email, `Appointment Confirmed — ${details.service}`, html);
}

// ── Appointment status update email ──────────────────────────────────
export async function sendAppointmentStatusEmail(email: string, name: string, status: string, details: { service: string; date: string; time: string }, appointmentId?: string) {
  const statusConfig: Record<string, { title: string; message: string; color: string; bgColor: string; icon: string }> = {
    confirmed: {
      title: "Appointment Confirmed",
      message: "Your appointment has been confirmed. We look forward to seeing you!",
      color: "#16a34a", bgColor: "#f0fdf4", icon: "✅",
    },
    cancelled: {
      title: "Appointment Cancelled",
      message: "Your appointment has been cancelled. If this was a mistake, please contact us to reschedule.",
      color: "#dc2626", bgColor: "#fef2f2", icon: "❌",
    },
    completed: {
      title: "Thank You for Visiting!",
      message: "We hope you had a wonderful experience at Haven Medical. Your health and beauty are our priority.",
      color: "#1fbda6", bgColor: "#ecfdf5", icon: "🌟",
    },
  };
  const info = statusConfig[status];
  if (!info) return;

  const html = emailWrapper(`
    ${iconCircle(info.icon)}
    <h2 style="text-align:center;color:${info.color};font-size:22px;font-weight:700;margin:0 0 8px;">${info.title}</h2>
    <p style="text-align:center;color:#7c8694;font-size:14px;margin:0 0 24px;">Hi ${name}</p>

    <div style="background:${info.bgColor};border-radius:8px;padding:16px 20px;border-left:4px solid ${info.color};margin-bottom:24px;">
      <p style="color:#4a5568;font-size:14px;line-height:1.6;margin:0;">${info.message}</p>
    </div>

    ${detailsCard([
      { label: "Service", value: details.service },
      { label: "Date", value: details.date },
      { label: "Time", value: details.time },
    ])}

    ${status === "confirmed" && appointmentId ? calendarEmailButtons(appointmentId, { id: appointmentId, name, ...details }) : ""}
    ${status === "completed" ? ctaButton(`${BASE_URL}/appointment`, "Book Another Appointment") : ""}
    ${status === "cancelled" ? ctaButton(`${BASE_URL}/appointment`, "Reschedule Appointment", "#4a5568") : ""}

    <p style="color:#7c8694;font-size:13px;text-align:center;margin-top:16px;">
      Questions? Contact us at <a href="tel:${PHONE.replace(/\s/g, "")}" style="color:#1fbda6;text-decoration:none;">${PHONE}</a>
    </p>
  `);
  await sendEmail(email, `Haven Medical — ${info.title}`, html);
}

// ── Appointment reminder email ───────────────────────────────────────
export async function sendAppointmentReminder(email: string, name: string, details: { service: string; date: string; time: string }, appointmentId?: string) {
  const html = emailWrapper(`
    ${iconCircle("🔔")}
    <h2 style="text-align:center;color:#1a1a2e;font-size:22px;font-weight:700;margin:0 0 8px;">Appointment Reminder</h2>
    <p style="text-align:center;color:#7c8694;font-size:14px;margin:0 0 24px;">Your appointment is tomorrow, ${name}</p>

    ${detailsCard([
      { label: "Service", value: details.service },
      { label: "Date", value: details.date },
      { label: "Time", value: details.time },
      { label: "Location", value: "Haven Medical Clinic" },
    ])}

    <div style="background:#eff6ff;border-radius:8px;padding:16px 20px;border-left:4px solid #3b82f6;">
      <p style="color:#1e40af;font-size:13px;line-height:1.5;margin:0;">
        <strong>Reminder:</strong> Please arrive 10 minutes early. Don't forget to bring any relevant medical documents or prescriptions.
      </p>
    </div>

    ${appointmentId ? calendarEmailButtons(appointmentId, { id: appointmentId, name, ...details }) : ""}

    <p style="color:#7c8694;font-size:13px;text-align:center;margin-top:24px;">
      Need to reschedule? Contact us at <a href="tel:${PHONE.replace(/\s/g, "")}" style="color:#1fbda6;text-decoration:none;">${PHONE}</a>
    </p>
  `);
  await sendEmail(email, `Reminder: ${details.service} — Tomorrow`, html);
}

// ── Contact form notification to clinic ──────────────────────────────
export async function sendContactNotification(data: { name: string; email: string; phone: string; subject: string; message: string }) {
  const html = emailWrapper(`
    ${iconCircle("📩")}
    <h2 style="text-align:center;color:#1a1a2e;font-size:22px;font-weight:700;margin:0 0 8px;">New Contact Form Message</h2>
    <p style="text-align:center;color:#7c8694;font-size:14px;margin:0 0 24px;">Received from the website</p>

    ${detailsCard([
      { label: "Name", value: data.name },
      { label: "Email", value: `<a href="mailto:${data.email}" style="color:#1fbda6;text-decoration:none;">${data.email}</a>` },
      { label: "Phone", value: data.phone || "—" },
      { label: "Subject", value: data.subject },
    ])}

    <div style="background:#f7f8fa;border-radius:10px;padding:20px 24px;margin-top:16px;">
      <p style="color:#7c8694;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;margin:0 0 8px;">Message</p>
      <p style="color:#1a1a2e;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${data.message}</p>
    </div>

    ${ctaButton(`mailto:${data.email}`, "Reply to " + data.name)}
  `);
  await sendEmail(process.env.SMTP_USER || "havenmedicalcliniclb@gmail.com", `Contact Form: ${data.subject} — ${data.name}`, html);
}

// ── Contact form auto-reply ──────────────────────────────────────────
export async function sendContactAutoReply(email: string, name: string) {
  const html = emailWrapper(`
    ${iconCircle("💬")}
    <h2 style="text-align:center;color:#1a1a2e;font-size:22px;font-weight:700;margin:0 0 8px;">We Received Your Message!</h2>
    <p style="text-align:center;color:#7c8694;font-size:14px;margin:0 0 24px;">Thank you for reaching out, ${name}</p>

    <p style="color:#4a5568;font-size:14px;line-height:1.7;">
      Thank you for contacting <strong>Haven Medical Clinic</strong>. Our team has received your message and will get back to you within <strong>24 hours</strong>.
    </p>

    <div style="background:#f0fdf4;border-radius:8px;padding:16px 20px;border-left:4px solid #1fbda6;margin:24px 0;">
      <p style="color:#166534;font-size:13px;line-height:1.5;margin:0;">
        <strong>In the meantime,</strong> you can book an appointment online or explore our services.
      </p>
    </div>

    <div style="text-align:center;margin:28px 0 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="border-radius:8px;background:#1fbda6;margin-right:12px;">
            <a href="${BASE_URL}/appointment" target="_blank"
              style="display:inline-block;padding:14px 28px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
              Book Appointment
            </a>
          </td>
          <td style="width:12px;">&nbsp;</td>
          <td style="border-radius:8px;border:2px solid #1fbda6;">
            <a href="${BASE_URL}/services" target="_blank"
              style="display:inline-block;padding:12px 28px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:700;color:#1fbda6;text-decoration:none;">
              Our Services
            </a>
          </td>
        </tr>
      </table>
    </div>
  `);
  await sendEmail(email, "Haven Medical — We Received Your Message", html);
}

// ── Newsletter campaign email ────────────────────────────────────────
export async function sendCampaignEmail(email: string, subject: string, content: string, subscriberId: string) {
  const html = emailWrapper(`
    <div style="color:#4a5568;font-size:15px;line-height:1.8;white-space:pre-wrap;">${content}</div>

    ${ctaButton(`${BASE_URL}`, "Visit Haven Medical")}
  `, subscriberId);
  await sendEmail(email, subject, html);
}
