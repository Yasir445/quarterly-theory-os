"use client";

import { useMutation } from "@tanstack/react-query";
import type {
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ApiResponse,
} from "@qt/types";

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as ApiResponse<TResponse>;

  if (!json.success) {
    throw new Error(json.error.message);
  }
  return json.data;
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      postJson<{ id: string; email: string; name: string | null }>("/api/auth/register", input),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) =>
      postJson<{ message: string }>("/api/auth/forgot-password", input),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput & { email: string }) =>
      postJson<{ message: string }>("/api/auth/reset-password", input),
  });
}
