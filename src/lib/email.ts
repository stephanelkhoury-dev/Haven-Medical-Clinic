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

// ── Send a generic email ─────────────────────────────────────────────
export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = getTransporter();
  await transporter.sendMail({ from: FROM, to, subject, html });
}

// ── Client account setup email ───────────────────────────────────────
export async function sendClientSetupEmail(email: string, name: string, token: string) {
  const link = `${BASE_URL}/portal/setup?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Haven<span style="color: #1fbda6;">Medical</span></h1>
      </div>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
        <h2 style="color: #1a1a2e; margin-top: 0;">Welcome, ${name}!</h2>
        <p style="color: #555; line-height: 1.6;">
          Your account has been created at Haven Medical Clinic. Please set up your password to access your patient portal where you can view your appointments and treatment history.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${link}" 
             style="display: inline-block; background: #1fbda6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Set Up Your Password
          </a>
        </div>
        <p style="color: #888; font-size: 13px; line-height: 1.5;">
          This link expires in 48 hours. If you did not expect this email, you can safely ignore it.
        </p>
      </div>
      <p style="color: #aaa; font-size: 12px; text-align: center;">
        &copy; ${new Date().getFullYear()} Haven Medical Clinic. All rights reserved.
      </p>
    </div>
  `;

  await sendEmail(email, "Welcome to Haven Medical — Set Up Your Account", html);
}

// ── Password reset email ─────────────────────────────────────────────
export async function sendClientResetEmail(email: string, name: string, token: string) {
  const link = `${BASE_URL}/portal/reset-password?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Haven<span style="color: #1fbda6;">Medical</span></h1>
      </div>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
        <h2 style="color: #1a1a2e; margin-top: 0;">Password Reset</h2>
        <p style="color: #555; line-height: 1.6;">
          Hi ${name}, we received a request to reset your password. Click the button below to choose a new password.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${link}" 
             style="display: inline-block; background: #1fbda6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="color: #888; font-size: 13px; line-height: 1.5;">
          This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
      <p style="color: #aaa; font-size: 12px; text-align: center;">
        &copy; ${new Date().getFullYear()} Haven Medical Clinic. All rights reserved.
      </p>
    </div>
  `;

  await sendEmail(email, "Haven Medical — Reset Your Password", html);
}
