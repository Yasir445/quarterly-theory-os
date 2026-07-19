import { prisma } from "@/lib/db";
import type { Role } from "@qt/database";

/**
 * Repository layer: the only place that talks to Prisma for User records.
 * Services call these functions rather than importing `prisma` directly —
 * this keeps query logic in one auditable place and makes the service
 * layer trivially unit-testable by mocking this module.
 */

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function createUser(input: { name: string; email: string; passwordHash: string }) {
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
    },
  });
}

export function updateUserPassword(userId: string, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export function markEmailVerified(email: string) {
  return prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { emailVerified: new Date() },
  });
}

export function updateUserRole(userId: string, role: Role) {
  return prisma.user.update({ where: { id: userId }, data: { role } });
}

/** Deletes every active Session row for a user — used to force logout
 *  everywhere after a password reset or admin-initiated suspension. */
export function revokeAllSessions(userId: string) {
  return prisma.session.deleteMany({ where: { userId } });
}

// ── Verification / reset tokens (Auth.js VerificationToken table) ──

export function createVerificationToken(input: { identifier: string; token: string; expires: Date }) {
  return prisma.verificationToken.create({ data: input });
}

export function findVerificationToken(identifier: string, token: string) {
  return prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });
}

export function deleteVerificationToken(identifier: string, token: string) {
  return prisma.verificationToken.delete({
    where: { identifier_token: { identifier, token } },
  });
}

/** Invalidates any previously-issued tokens of a given kind for this
 *  identifier before issuing a new one, so only the most recent reset/
 *  verification link is ever valid. */
export function deleteVerificationTokensByIdentifier(identifier: string) {
  return prisma.verificationToken.deleteMany({ where: { identifier } });
}
