"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ApiResponse } from "@qt/types";
import { Button } from "@/components/ui/button";

type Status = "loading" | "success" | "error";

export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("This verification link is missing required parameters.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
      .then((res) => res.json() as Promise<ApiResponse<{ message: string }>>)
      .then((json) => {
        if (json.success) {
          setStatus("success");
          setMessage("Your email has been verified. You can now log in.");
        } else {
          setStatus("error");
          setMessage(json.error.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong verifying your email.");
      });
  }, [searchParams]);

  return (
    <div className="text-center py-6">
      <h2 className="font-display text-xl font-semibold mb-2">
        {status === "loading" ? "Verifying..." : status === "success" ? "Email verified" : "Verification failed"}
      </h2>
      <p className="text-sm text-slate-400 mb-6">{message}</p>
      {status !== "loading" && (
        <Button asChild>
          <Link href="/login">Go to log in</Link>
        </Button>
      )}
    </div>
  );
}
