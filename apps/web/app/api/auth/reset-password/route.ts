import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema, apiSuccess, apiError } from "@qt/types";
import { resetPassword, AuthServiceError } from "@/features/auth/services/auth.service";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const bodySchema = resetPasswordSchema.and(z.object({ email: z.string().email() }));

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const limit = await rateLimit(`reset-password:${ip}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json(apiError("Too many attempts. Try again in a minute.", "RATE_LIMITED"), { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      apiError("Invalid input.", "VALIDATION_ERROR", parsed.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  try {
    await resetPassword(parsed.data.email, parsed.data);
    return NextResponse.json(apiSuccess({ message: "Password updated. You can now log in." }));
  } catch (err) {
    if (err instanceof AuthServiceError) {
      return NextResponse.json(apiError(err.message, err.code), { status: 400 });
    }
    console.error("[POST /api/auth/reset-password]", err);
    return NextResponse.json(apiError("Something went wrong. Please try again.", "INTERNAL_ERROR"), { status: 500 });
  }
}
