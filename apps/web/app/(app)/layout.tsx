import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Belt-and-suspenders: middleware already redirects unauthenticated
  // requests away from this route group, but layouts render for every
  // nested page, so this also protects against any future route added
  // here without updating the middleware matcher.
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <div className="min-h-screen bg-[#05070A] text-white">{children}</div>;
}
