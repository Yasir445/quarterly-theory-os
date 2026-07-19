import crypto from "crypto";

/**
 * We reuse Auth.js's VerificationToken table for both email verification
 * and password reset, disambiguated by the `identifier` value:
 *   - email verification: identifier = `verify-email:${email}`
 *   - password reset:     identifier = `reset-password:${email}`
 *
 * This keeps a second bespoke table off the schema for something Auth.js
 * already models well.
 */

export const TOKEN_PREFIX = {
  VERIFY_EMAIL: "verify-email",
  RESET_PASSWORD: "reset-password",
} as const;

export function buildIdentifier(prefix: (typeof TOKEN_PREFIX)[keyof typeof TOKEN_PREFIX], email: string): string {
  return `${prefix}:${email.toLowerCase()}`;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function expiresInHours(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
