"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@qt/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SocialAuthButtons } from "./social-auth-buttons";
import { useRegister } from "../hooks/use-auth-mutations";

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterInput) {
    try {
      await registerMutation.mutateAsync(values);
      setSubmitted(true);
      // Deliberately not auto-logging-in here: email verification is
      // required first (see features/auth/services/auth.service.ts).
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      // Error is already surfaced via registerMutation.error below.
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <h2 className="font-display text-xl font-semibold mb-2">Check your inbox</h2>
        <p className="text-sm text-slate-400">
          We sent a verification link to your email. Redirecting you to log in...
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Trader" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="At least 8 characters" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {registerMutation.error && (
          <p className="text-sm font-medium text-destructive">{registerMutation.error.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Creating account..." : "Create Account"}
        </Button>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          By signing up, you agree to the Terms of Service and Privacy Policy.
        </p>

        <div className="flex items-center gap-3 py-2">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] text-slate-500">OR CONTINUE WITH</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <SocialAuthButtons />
      </form>
    </Form>
  );
}
