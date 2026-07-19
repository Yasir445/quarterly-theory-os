"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@qt/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useResetPassword } from "../hooks/use-auth-mutations";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const resetPassword = useResetPassword();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  if (!token || !email) {
    return (
      <div className="text-center py-6">
        <h2 className="font-display text-xl font-semibold mb-2">Invalid link</h2>
        <p className="text-sm text-slate-400">
          This password reset link is missing required parameters. Request a new one from the forgot password page.
        </p>
      </div>
    );
  }

  async function onSubmit(values: ResetPasswordInput) {
    await resetPassword.mutateAsync({ ...values, email });
    setTimeout(() => router.push("/login"), 1500);
  }

  if (resetPassword.isSuccess) {
    return (
      <div className="text-center py-6">
        <h2 className="font-display text-xl font-semibold mb-2">Password updated</h2>
        <p className="text-sm text-slate-400">Redirecting you to log in...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="At least 8 characters" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Repeat password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {resetPassword.error && <p className="text-sm font-medium text-destructive">{resetPassword.error.message}</p>}

        <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
          {resetPassword.isPending ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </Form>
  );
}
