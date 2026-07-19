import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Welcome back</h1>
      <p className="text-sm text-slate-500 mb-6">Log in to continue your research.</p>

      <Suspense>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-slate-400 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-cyan-300 hover:text-cyan-200">
          Sign up
        </Link>
      </p>
    </div>
  );
}
