import bcrypt from "bcryptjs";

// 12 rounds balances hashing cost against login-request latency; matches
// current OWASP guidance for bcrypt as of 2024–2025. Revisit if login
// endpoint p95 latency becomes a problem under load.
const SALT_ROUNDS = 12;

export async function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

export async function verifyPassword(plainTextPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, hash);
}
