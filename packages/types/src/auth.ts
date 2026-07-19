import { z } from "zod";

/**
 * These schemas are imported on both the client (React Hook Form resolvers)
 * and the server (API route validation), so client-side and server-side
 * validation can never drift out of sync.
 */

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .toLowerCase()
  .trim();

// Mirrors common production password policy: 8+ chars, at least one letter
// and one number. Kept intentionally simple — swap in zxcvbn strength
// scoring on the client if product wants a strength meter later.
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be under 72 characters") // bcrypt's effective limit
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/** Roles mirrored from the Prisma `Role` enum — kept as a literal union here
 * so packages that shouldn't depend on @qt/database (e.g. a future mobile
 * client) can still type against roles. */
export const roleSchema = z.enum(["USER", "MODERATOR", "ADMIN"]);
export type Role = z.infer<typeof roleSchema>;
