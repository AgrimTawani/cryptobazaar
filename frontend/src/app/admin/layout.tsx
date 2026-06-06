import { requireAdmin, isSecondaryPasswordUnlocked } from "@/lib/admin-auth";
import { AdminPasswordPrompt } from "./AdminPasswordPrompt";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAuthorized = await requireAdmin();
  
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="bg-white p-8 rounded-xl border border-red-200 shadow-sm text-center">
          <h2 className="font-sans text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="font-sans text-sm text-[#555]">Your account is not authorized to view the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const isUnlocked = await isSecondaryPasswordUnlocked();

  if (!isUnlocked) {
    return <AdminPasswordPrompt />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6 flex flex-col shrink-0">
        <div className="mb-10">
          <h1 className="font-condensed text-2xl tracking-[1px] text-lime">CB ADMIN</h1>
        </div>
        
        <nav className="flex flex-col gap-3 flex-1">
          <Link href="/admin" className="font-sans text-sm text-[#aaa] hover:text-white transition-colors no-underline">Dashboard</Link>
          <Link href="/admin/users" className="font-sans text-sm text-[#aaa] hover:text-white transition-colors no-underline">Users & Approvals</Link>
          <Link href="/admin/disputes" className="font-sans text-sm text-[#aaa] hover:text-white transition-colors no-underline">Disputes</Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-[#333] flex items-center gap-3">
          <UserButton />
          <span className="font-sans text-xs text-[#888]">Super Admin</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
