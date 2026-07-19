import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Create your account</h1>
      <p className="text-sm text-slate-500 mb-6">Start your 7-day free trial — no card required.</p>

      <RegisterForm />

      <p className="text-center text-sm text-slate-400 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-cyan-300 hover:text-cyan-200">
          Log in
        </Link>
      </p>
    </div>
  );
}
