import type { DefaultSession } from "next-auth";

/**
 * Extends Auth.js's built-in types with the fields we attach in the
 * `session` callback (lib/auth.ts). Without this, `session.user.role`
 * would be a TypeScript error everywhere it's used.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "MODERATOR" | "ADMIN";
    } & DefaultSession["user"];
  }
}
