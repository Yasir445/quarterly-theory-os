import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Set New Password" };

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Set a new password</h1>
      <p className="text-sm text-slate-500 mb-6">Choose a new password for your account.</p>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
