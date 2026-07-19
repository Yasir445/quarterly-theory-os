import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiSuccess, apiError } from "@qt/types";
import { verifyEmail, AuthServiceError } from "@/features/auth/services/auth.service";

const querySchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse({
    email: req.nextUrl.searchParams.get("email"),
    token: req.nextUrl.searchParams.get("token"),
  });

  if (!parsed.success) {
    return NextResponse.json(apiError("Invalid or missing verification parameters.", "VALIDATION_ERROR"), {
      status: 400,
    });
  }

  try {
    await verifyEmail(parsed.data.email, parsed.data.token);
    return NextResponse.json(apiSuccess({ message: "Email verified." }));
  } catch (err) {
    if (err instanceof AuthServiceError) {
      return NextResponse.json(apiError(err.message, err.code), { status: 400 });
    }
    console.error("[GET /api/auth/verify-email]", err);
    return NextResponse.json(apiError("Something went wrong.", "INTERNAL_ERROR"), { status: 500 });
  }
}
