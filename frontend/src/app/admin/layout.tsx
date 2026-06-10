import { isSecondaryPasswordUnlocked } from "@/lib/admin-auth";
import { AdminPasswordPrompt } from "./AdminPasswordPrompt";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isUnlocked = await isSecondaryPasswordUnlocked();

  if (!isUnlocked) {
    return <AdminPasswordPrompt />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black text-white p-4 md:p-6 flex flex-row md:flex-col items-center md:items-stretch gap-4 md:gap-0 shrink-0">
        <div className="md:mb-10 shrink-0">
          <h1 className="font-condensed text-2xl tracking-[1px] text-lime">CB ADMIN</h1>
        </div>

        <nav className="flex flex-row md:flex-col gap-4 md:gap-3 flex-1 flex-wrap">
          <Link href="/admin" className="font-sans text-sm text-[#aaa] hover:text-white transition-colors no-underline">Dashboard</Link>
          <Link href="/admin/users" className="font-sans text-sm text-[#aaa] hover:text-white transition-colors no-underline">Users &amp; Approvals</Link>
          <Link href="/admin/disputes" className="font-sans text-sm text-[#aaa] hover:text-white transition-colors no-underline">Disputes</Link>
        </nav>

        <div className="md:mt-auto md:pt-6 md:border-t md:border-[#333] flex items-center gap-3 shrink-0">
          <span className="font-sans text-xs text-[#888] whitespace-nowrap">Super Admin</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:h-screen md:overflow-y-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
