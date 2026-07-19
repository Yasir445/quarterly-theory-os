import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#05070A] text-white flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute -top-40 left-1/4 w-[700px] h-[700px] rounded-full opacity-[0.15]"
          style={{ background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)", filter: "blur(110px)" }}
        />
        <div
          className="absolute bottom-0 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.12]"
          style={{ background: "radial-gradient(circle, #A855F7 0%, transparent 70%)", filter: "blur(110px)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-display font-bold text-[#05070A]"
            style={{ boxShadow: "0 0 24px rgba(59,130,246,0.5)" }}
          >
            Q
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">Quarterly Theory</span>
        </Link>

        <div
          className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8"
          style={{ boxShadow: "0 0 60px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05)" }}
        >
          {children}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">Educational platform — not financial advice.</p>
      </div>
    </div>
  );
}
