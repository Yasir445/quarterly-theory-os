import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@qt/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // Database sessions (not JWT): lets us force-revoke a session server-side
  // — e.g. when an admin suspends an account, or a user changes their
  // password — by simply deleting the Session row. A stateless JWT can't
  // be revoked without an extra denylist, which is more moving parts for
  // the same outcome.
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/login", // surfaced via ?error= search param, read by the login form
    verifyRequest: "/verify-email",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        // Deliberately identical error path whether the user doesn't exist
        // or the password is wrong — don't leak which one it was.
        if (!user || !user.passwordHash) return null;

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),

    // OAuth providers are optional at runtime — if the env vars are unset,
    // NextAuth simply won't register the provider, and the corresponding
    // button in SocialAuthButtons should be hidden (see that component).
    ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
      ? [Google({ clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET })]
      : []),
    ...(env.AUTH_APPLE_ID && env.AUTH_APPLE_SECRET
      ? [Apple({ clientId: env.AUTH_APPLE_ID, clientSecret: env.AUTH_APPLE_SECRET })]
      : []),
  ],

  callbacks: {
    async session({ session, user }) {
      // With the database strategy, `user` is the full Prisma User row —
      // attach the fields the app actually needs onto the session object
      // so client components don't need a separate fetch for role, etc.
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as { role?: "USER" | "MODERATOR" | "ADMIN" }).role ?? "USER";
      }
      return session;
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`[auth] new user signed up: ${user.email}`);
        // Hook point for future modules: create default ResearchFolder rows,
        // send a welcome email, enqueue a trial-started analytics event, etc.
      }
    },
  },
});
