import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  OPEN:               { label: "Open",          cls: "bg-[#fef2f2] text-[#991b1b]" },
  EVIDENCE_SUBMITTED: { label: "Evidence In",   cls: "bg-[#fffbeb] text-[#92400e]" },
  UNDER_REVIEW:       { label: "Under Review",  cls: "bg-[#eff6ff] text-[#1e40af]" },
  RESOLVED_BUYER:     { label: "Buyer Won",     cls: "bg-[#f0fdf4] text-[#166534]" },
  RESOLVED_SELLER:    { label: "Seller Won",    cls: "bg-[#f0fdf4] text-[#166534]" },
};

export default async function AdminDisputesPage() {
  const disputes = await db.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          orderId: true,
          displayId: true,
          amount: true,
          asset: true,
          totalValueInr: true,
          seller: { select: { name: true, email: true } },
          buyer:  { select: { name: true, email: true } },
        },
      },
      raiser: { select: { email: true, name: true } },
    },
  });

  return (
    <div>
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="font-condensed text-3xl uppercase tracking-[1px]">Disputes</h1>
        <span className="font-sans text-sm text-[#888]">{disputes.length} total</span>
      </div>

      <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-x-auto shadow-sm">
        <div className="min-w-170">
          {/* Header */}
          <div className="grid grid-cols-[minmax(120px,140px)_1fr_1fr_130px_120px_90px] gap-4 py-3 px-6 bg-[#f8f8f8] border-b border-[#ebebeb] font-sans text-xs text-[#888] font-semibold uppercase tracking-widest">
            <span>Order ID</span>
            <span>Seller</span>
            <span>Buyer</span>
            <span>Value</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {disputes.map((d) => {
            const cfg = STATUS_CFG[d.status] ?? { label: d.status, cls: "bg-[#f5f5f5] text-[#555]" };
            const raisedBySeller = d.raisedByRole === "seller";
            return (
              <div
                key={d.id}
                className="grid grid-cols-[minmax(120px,140px)_1fr_1fr_130px_120px_90px] gap-4 py-4 px-6 border-b border-[#f2f2f2] items-center last:border-b-0 hover:bg-[#fafafa] transition-colors"
              >
                {/* Order ID */}
                <div className="min-w-0">
                  <p className="font-sans text-sm font-semibold text-[#111]">#{d.order.displayId}</p>
                  <p className="font-sans text-[0.6rem] text-[#bbb] mt-0.5">
                    {new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>

                {/* Seller */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-sans text-sm font-semibold text-[#111] truncate">
                      {d.order.seller.name || "Unknown"}
                    </p>
                    {raisedBySeller && (
                      <span className="shrink-0 font-sans text-[0.55rem] font-bold bg-[#fef2f2] text-[#991b1b] px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        raised
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-[#aaa] truncate">{d.order.seller.email}</p>
                </div>

                {/* Buyer */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-sans text-sm font-semibold text-[#111] truncate">
                      {d.order.buyer?.name || "—"}
                    </p>
                    {!raisedBySeller && d.order.buyer && (
                      <span className="shrink-0 font-sans text-[0.55rem] font-bold bg-[#fef2f2] text-[#991b1b] px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        raised
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-[#aaa] truncate">{d.order.buyer?.email || "—"}</p>
                </div>

                {/* Value */}
                <div>
                  <p className="font-mono text-sm text-[#111]">₹{Number(d.order.totalValueInr).toLocaleString("en-IN")}</p>
                  <p className="font-sans text-xs text-[#aaa]">{Number(d.order.amount)} {d.order.asset}</p>
                </div>

                {/* Status */}
                <div>
                  <span className={`font-sans text-[0.65rem] font-bold px-2.5 py-1 rounded-full ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Action */}
                <div>
                  <Link
                    href={`/admin/disputes/${d.id}`}
                    className="inline-flex items-center gap-1 font-sans text-sm font-semibold text-[#7b3fe4] hover:underline"
                  >
                    Review <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}

          {disputes.length === 0 && (
            <div className="p-10 text-center text-[#888] font-sans text-sm">No disputes found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
