"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

/**
 * NOTE: these render unconditionally here for simplicity. In production,
 * gate visibility behind public env flags (e.g. NEXT_PUBLIC_GOOGLE_AUTH_ENABLED)
 * that mirror whether AUTH_GOOGLE_ID/AUTH_APPLE_ID are set server-side —
 * otherwise a misconfigured deploy shows a button that 404s on click.
 */
export function SocialAuthButtons({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button type="button" variant="outline" onClick={() => signIn("google", { callbackUrl })}>
        Google
      </Button>
      <Button type="button" variant="outline" onClick={() => signIn("apple", { callbackUrl })}>
        Apple
      </Button>
    </div>
  );
}
