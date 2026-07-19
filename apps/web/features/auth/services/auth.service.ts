import { env } from "@/lib/env";
import { hashPassword } from "@/lib/password";
import { sendEmail, verificationEmailHtml, passwordResetEmailHtml } from "@/lib/email";
import { TOKEN_PREFIX, buildIdentifier, generateToken, expiresInHours } from "@/lib/tokens";
import type { RegisterInput, ForgotPasswordInput, ResetPasswordInput } from "@qt/types";

import * as userRepo from "../repositories/user.repository";

/**
 * Service layer: business logic and orchestration across repositories,
 * email, and token generation. API routes call these functions and
 * translate the result/errors into HTTP responses — routes should not
 * contain business logic themselves (see app/api/auth/register/route.ts).
 */

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export async function registerUser(input: RegisterInput) {
  const existing = await userRepo.findUserByEmail(input.email);
  if (existing) {
    // Same message regardless of whether it's an OAuth-only account or a
    // credentials account, so we don't leak account existence + provider.
    throw new AuthServiceError("An account with this email already exists.", "EMAIL_TAKEN");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await userRepo.createUser({
    name: input.name,
    email: input.email,
    passwordHash,
  });

  await sendVerificationEmail(user.email);

  return user;
}

export async function sendVerificationEmail(email: string) {
  const identifier = buildIdentifier(TOKEN_PREFIX.VERIFY_EMAIL, email);
  await userRepo.deleteVerificationTokensByIdentifier(identifier);

  const token = generateToken();
  await userRepo.createVerificationToken({
    identifier,
    token,
    expires: expiresInHours(24),
  });

  const verifyUrl = `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  await sendEmail({
    to: email,
    subject: "Verify your Quarterly Theory account",
    html: verificationEmailHtml(verifyUrl),
  });
}

export async function verifyEmail(email: string, token: string) {
  const identifier = buildIdentifier(TOKEN_PREFIX.VERIFY_EMAIL, email);
  const record = await userRepo.findVerificationToken(identifier, token);

  if (!record || record.expires < new Date()) {
    throw new AuthServiceError("This verification link is invalid or has expired.", "INVALID_TOKEN");
  }

  await userRepo.markEmailVerified(email);
  await userRepo.deleteVerificationToken(identifier, token);
}

export async function requestPasswordReset(input: ForgotPasswordInput) {
  const user = await userRepo.findUserByEmail(input.email);

  // Deliberately do NOT throw if the user doesn't exist — the API route
  // returns a generic "check your email" response either way, so this
  // endpoint can't be used to enumerate registered emails.
  if (!user || !user.passwordHash) return;

  const identifier = buildIdentifier(TOKEN_PREFIX.RESET_PASSWORD, input.email);
  await userRepo.deleteVerificationTokensByIdentifier(identifier);

  const token = generateToken();
  await userRepo.createVerificationToken({
    identifier,
    token,
    expires: expiresInHours(1),
  });

  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(input.email)}`;
  await sendEmail({
    to: input.email,
    subject: "Reset your Quarterly Theory password",
    html: passwordResetEmailHtml(resetUrl),
  });
}

export async function resetPassword(email: string, input: ResetPasswordInput) {
  const identifier = buildIdentifier(TOKEN_PREFIX.RESET_PASSWORD, email);
  const record = await userRepo.findVerificationToken(identifier, input.token);

  if (!record || record.expires < new Date()) {
    throw new AuthServiceError("This reset link is invalid or has expired.", "INVALID_TOKEN");
  }

  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    throw new AuthServiceError("Account not found.", "NOT_FOUND");
  }

  const passwordHash = await hashPassword(input.password);
  await userRepo.updateUserPassword(user.id, passwordHash);
  await userRepo.deleteVerificationToken(identifier, input.token);

  // Force re-login everywhere — a leaked/compromised password reset flow
  // shouldn't leave old sessions valid.
  await userRepo.revokeAllSessions(user.id);
}
