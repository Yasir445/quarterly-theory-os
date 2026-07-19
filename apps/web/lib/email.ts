import { Resend } from "resend";
import { env } from "./env";

/**
 * Transactional email service.
 *
 * INTEGRATION POINT: requires RESEND_API_KEY in your environment (see
 * .env.example). Without it, this throws instead of silently pretending
 * to send an email — a verification/reset flow that "succeeds" without
 * actually sending mail is a worse failure mode than a loud error in logs.
 *
 * Swap providers by changing this file only — every caller uses the
 * `sendEmail` interface below, not the Resend SDK directly.
 */

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  if (!resend) {
    if (env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not configured — cannot send email in production.");
    }
    // Dev fallback: log instead of sending, so the auth flow is still
    // exercisable locally without a Resend account.
    console.warn(`[email:dev] Would send to ${to} — subject: "${subject}"\n${html}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM ?? "Quarterly Theory <noreply@quarterlytheory.app>",
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send email via Resend: ${error.message}`);
  }
}

export function verificationEmailHtml(verifyUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Verify your email</h2>
      <p>Confirm your email address to finish setting up your Quarterly Theory account.</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#3B82F6;color:white;border-radius:8px;text-decoration:none;">Verify Email</a></p>
      <p style="color:#888;font-size:12px;">If you didn't create this account, you can ignore this email.</p>
    </div>
  `;
}

export function passwordResetEmailHtml(resetUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Reset your password</h2>
      <p>Click below to choose a new password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#3B82F6;color:white;border-radius:8px;text-decoration:none;">Reset Password</a></p>
      <p style="color:#888;font-size:12px;">If you didn't request this, you can ignore this email — your password won't change.</p>
    </div>
  `;
}
