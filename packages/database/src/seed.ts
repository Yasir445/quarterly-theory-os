import { prisma } from "./client";

/**
 * Database seed script — run with `pnpm db:seed`.
 *
 * Currently seeds a single admin account for local development so the
 * Admin Panel module (built in a later increment) has something to log
 * into against. Extend this as each module lands: seed Lessons from the
 * Quarterly Theory knowledge base, seed GlossaryTerms, etc.
 */
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@quarterlytheory.local";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Seed: admin user already exists (${email}), skipping.`);
    return;
  }

  // NOTE: password hashing lives in apps/web/lib/password.ts (bcrypt) so the
  // database package doesn't need bcrypt as a dependency. For seeding, set
  // SEED_ADMIN_PASSWORD_HASH to a pre-hashed value, or leave the account
  // OAuth-only (passwordHash: null) and log in with Google in dev.
  await prisma.user.create({
    data: {
      email,
      name: "Admin",
      role: "ADMIN",
      passwordHash: process.env.SEED_ADMIN_PASSWORD_HASH ?? null,
      emailVerified: new Date(),
    },
  });

  console.log(`Seed: created admin user ${email}`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
