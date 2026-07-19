import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Reset Password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Reset your password</h1>
      <p className="text-sm text-slate-500 mb-6">Enter your email and we&apos;ll send a reset link.</p>
      <ForgotPasswordForm />
    </div>
  );
}
