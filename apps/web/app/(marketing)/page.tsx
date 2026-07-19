import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Placeholder home page. The full marketing Landing Page (hero, feature
 * showcase, pricing, testimonials, FAQ) is its own module and will replace
 * this once built — kept intentionally minimal here so the Auth module can
 * be reviewed and merged on its own without an unrelated giant landing
 * page in the same diff.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col items-center justify-center px-6 text-center">
      <div
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-display font-bold text-xl text-[#05070A] mb-6"
        style={{ boxShadow: "0 0 30px rgba(59,130,246,0.5)" }}
      >
        Q
      </div>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Quarterly Theory OS</h1>
      <p className="text-slate-500 max-w-sm mb-8">
        Auth module is live. Landing page, dashboard, and the rest of the platform are built next, module by
        module.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/register">Create Account</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    </div>
  );
}
