import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema, apiSuccess, apiError } from "@qt/types";
import { requestPasswordReset } from "@/features/auth/services/auth.service";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const limit = await rateLimit(`forgot-password:${ip}`, 3, 60_000);
  if (!limit.success) {
    return NextResponse.json(apiError("Too many attempts. Try again in a minute.", "RATE_LIMITED"), { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      apiError("Invalid input.", "VALIDATION_ERROR", parsed.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  try {
    await requestPasswordReset(parsed.data);
  } catch (err) {
    // Still log unexpected failures, but never let them change the response
    // shape — see the "don't leak account existence" note in the service.
    console.error("[POST /api/auth/forgot-password]", err);
  }

  return NextResponse.json(apiSuccess({ message: "If that email is registered, a reset link is on its way." }));
}
