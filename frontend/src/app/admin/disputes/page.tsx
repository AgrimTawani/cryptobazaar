import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDisputesPage() {
  const disputes = await db.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: { orderId: true, amount: true, asset: true, totalValueInr: true }
      },
      raiser: { select: { email: true, name: true } }
    },
  });

  return (
    <div>
      <h1 className="font-condensed text-3xl mb-8 uppercase tracking-[1px]">Disputes</h1>

      <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-x-auto shadow-sm">
        <div className="min-w-[680px]">
        <div className="grid grid-cols-[100px_1fr_150px_150px_100px] gap-4 py-3 px-6 bg-[#f8f8f8] border-b border-[#ebebeb] font-sans text-xs text-[#888] font-semibold uppercase tracking-widest">
          <span>Order ID</span>
          <span>Raised By</span>
          <span>Value</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {disputes.map((d) => (
          <div key={d.id} className="grid grid-cols-[100px_1fr_150px_150px_100px] gap-4 py-4 px-6 border-b border-[#f2f2f2] items-center last:border-b-0 hover:bg-[#fafafa] transition-colors">
            <span className="font-mono text-sm text-[#555]">{d.order.orderId}</span>
            <div className="min-w-0">
              <p className="font-sans text-sm font-semibold text-[#111] truncate">{d.raiser.name || "Unknown"}</p>
              <p className="font-sans text-xs text-[#888] truncate">{d.raisedByRole} · {d.raiser.email}</p>
            </div>
            <div>
              <p className="font-mono text-sm text-[#111]">₹{Number(d.order.totalValueInr).toLocaleString()}</p>
              <p className="font-sans text-xs text-[#888]">{Number(d.order.amount)} {d.order.asset}</p>
            </div>
            <div>
              <span className={`font-sans text-[0.65rem] font-bold px-2 py-1 rounded-full ${
                d.status === "OPEN" || d.status === "EVIDENCE_SUBMITTED" || d.status === "UNDER_REVIEW" 
                  ? "bg-[#fef2f2] text-[#991b1b]" 
                  : "bg-[#f5f5f5] text-[#555]"
              }`}>
                {d.status}
              </span>
            </div>
            <div>
              <Link href={`/admin/disputes/${d.id}`} className="font-sans text-sm font-semibold text-[#7b3fe4] hover:underline">
                Review →
              </Link>
            </div>
          </div>
        ))}
        {disputes.length === 0 && (
          <div className="p-8 text-center text-[#888] font-sans text-sm">No active disputes found.</div>
        )}
        </div>
      </div>
    </div>
  );
}
