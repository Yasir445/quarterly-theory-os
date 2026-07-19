import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#05070A] text-white flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold mb-2">404</h1>
        <p className="text-slate-500 mb-6">This page doesn&apos;t exist.</p>
        <Link href="/" className="text-cyan-300 hover:text-cyan-200 text-sm">
          Back home
        </Link>
      </div>
    </div>
  );
}
