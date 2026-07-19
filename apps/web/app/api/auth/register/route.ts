import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@qt/types";
import { apiSuccess, apiError } from "@qt/types";
import { registerUser, AuthServiceError } from "@/features/auth/services/auth.service";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const limit = await rateLimit(`register:${ip}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json(apiError("Too many attempts. Try again in a minute.", "RATE_LIMITED"), { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      apiError("Invalid input.", "VALIDATION_ERROR", parsed.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  try {
    const user = await registerUser(parsed.data);
    return NextResponse.json(
      apiSuccess({ id: user.id, email: user.email, name: user.name }),
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof AuthServiceError) {
      return NextResponse.json(apiError(err.message, err.code), { status: 409 });
    }
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json(apiError("Something went wrong. Please try again.", "INTERNAL_ERROR"), { status: 500 });
  }
}
