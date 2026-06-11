import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { bankStatementAnalysis: true },
  });

  return (
    <div>
      <h1 className="font-condensed text-3xl mb-8 uppercase tracking-[1px]">Users & Approvals</h1>

      <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-x-auto shadow-sm">
        <div className="min-w-[760px]">
        <div className="grid grid-cols-[80px_1fr_150px_150px_150px_100px] gap-4 py-3 px-6 bg-[#f8f8f8] border-b border-[#ebebeb] font-sans text-xs text-[#888] font-semibold uppercase tracking-widest">
          <span>ID</span>
          <span>Name / Email</span>
          <span>Status</span>
          <span>Bank Analysis</span>
          <span>Total Volume</span>
          <span>Action</span>
        </div>

        {users.map((u) => (
          <div key={u.id} className="grid grid-cols-[80px_1fr_150px_150px_150px_100px] gap-4 py-4 px-6 border-b border-[#f2f2f2] items-center last:border-b-0 hover:bg-[#fafafa] transition-colors">
            <span className="font-mono text-sm text-[#555]">{u.id}</span>
            <div className="min-w-0">
              <p className="font-sans text-sm font-semibold text-[#111] truncate">{u.name || "Unknown"}</p>
              <p className="font-sans text-xs text-[#888] truncate">{u.email || u.clerkId}</p>
            </div>
            <div>
              <span className={`font-sans text-[0.65rem] font-bold px-2 py-1 rounded-full ${
                u.status === "VERIFIED" ? "bg-lime text-black" : 
                u.status === "VERIFICATION_PENDING" ? "bg-[#fef9ee] text-[#b45309]" : 
                "bg-[#f5f5f5] text-[#555]"
              }`}>
                {u.status}
              </span>
            </div>
            <div>
              {u.bankStatementAnalysis ? (
                <span className={`font-sans text-xs font-semibold ${u.bankStatementAnalysis.status === "APPROVED" ? "text-green-600" : "text-amber-600"}`}>
                  {u.bankStatementAnalysis.status}
                </span>
              ) : (
                <span className="font-sans text-xs text-[#aaa]">None</span>
              )}
            </div>
            <span className="font-mono text-sm">₹{Number(u.totalTradeVolumeInr).toLocaleString("en-IN")}</span>
            <div>
              <Link href={`/admin/users/${u.id}`} className="font-sans text-sm font-semibold text-[#7b3fe4] hover:underline">
                View <ArrowRight className="inline-block w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="p-8 text-center text-[#888] font-sans text-sm">No users found.</div>
        )}
        </div>
      </div>
    </div>
  );
}
