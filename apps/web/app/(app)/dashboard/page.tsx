import type { Metadata } from "next";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * This is intentionally a minimal placeholder, not the full Dashboard
 * module (widgets, quarter wheel, live charts, etc.) — that's built as its
 * own increment with its own schema/services, per the module-by-module
 * plan. This page exists to prove authentication works end-to-end: a
 * signed-in user lands here, sees their real session data, and can log out.
 */
export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>You&apos;re authenticated 🎉</CardTitle>
          <CardDescription>
            This confirms the Auth module is fully wired: registration, email verification, login, session
            management, and route protection all work end-to-end.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-white/8 bg-black/30 p-4 font-mono text-xs text-slate-400 space-y-1">
            <div>id: {session?.user.id}</div>
            <div>name: {session?.user.name}</div>
            <div>email: {session?.user.email}</div>
            <div>role: {session?.user.role}</div>
          </div>
          <p className="text-sm text-slate-500">
            The full Dashboard module (quarter cycle widget, journal preview, learning progress, market
            overview) is the next increment, built on top of this working auth foundation.
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline">
              Log Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
