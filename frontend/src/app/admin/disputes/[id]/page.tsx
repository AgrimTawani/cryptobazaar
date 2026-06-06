import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { DisputeActions } from "./DisputeActions";

export const dynamic = "force-dynamic";

export default async function AdminDisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const dispute = await db.dispute.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          seller: { select: { id: true, name: true, email: true } },
          buyer: { select: { id: true, name: true, email: true } }
        }
      },
      raiser: { select: { id: true, name: true } }
    },
  });

  if (!dispute) return notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-condensed text-3xl uppercase tracking-[1px] mb-1">Dispute Resolution</h1>
          <p className="font-sans text-sm text-[#888]">Order: {dispute.order.orderId} · Dispute ID: {dispute.id}</p>
        </div>
        <DisputeActions disputeId={dispute.id} currentStatus={dispute.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dispute Details */}
        <div className="bg-white p-6 rounded-xl border border-[#e8e8e8] shadow-sm lg:col-span-2">
          <h2 className="font-condensed text-xl mb-4 border-b border-[#eee] pb-2">Overview</h2>
          <div className="flex flex-col md:flex-row gap-8">
             <div className="flex-1">
                <p className="font-sans text-xs text-[#888] font-semibold uppercase mb-1">Status</p>
                <p className="font-sans text-sm font-bold">{dispute.status}</p>
             </div>
             <div className="flex-1">
                <p className="font-sans text-xs text-[#888] font-semibold uppercase mb-1">Raised By</p>
                <p className="font-sans text-sm">{dispute.raisedByRole} ({dispute.raiser.name})</p>
             </div>
             <div className="flex-1">
                <p className="font-sans text-xs text-[#888] font-semibold uppercase mb-1">Trade Value</p>
                <p className="font-sans text-sm font-bold">₹{Number(dispute.order.totalValueInr).toLocaleString()} / {Number(dispute.order.amount)} {dispute.order.asset}</p>
             </div>
             <div className="flex-1">
                <p className="font-sans text-xs text-[#888] font-semibold uppercase mb-1">Resolution</p>
                <p className="font-sans text-sm">{dispute.resolution || "Pending"}</p>
             </div>
          </div>
        </div>

        {/* Seller Info & Evidence */}
        <div className="bg-white p-6 rounded-xl border border-[#e8e8e8] shadow-sm">
          <h2 className="font-condensed text-xl mb-4 border-b border-[#eee] pb-2">Seller: {dispute.order.seller.name}</h2>
          <div className="flex flex-col gap-4">
             <div>
                <p className="font-sans text-xs text-[#888] font-semibold uppercase mb-1">Statement</p>
                <p className="font-sans text-sm bg-[#f5f5f5] p-3 rounded-lg border border-[#e8e8e8] min-h-[80px]">
                  {dispute.sellerStatement || "No statement provided."}
                </p>
             </div>
             <div className="flex justify-between items-center">
                <span className="font-sans text-sm font-semibold">Bank Statement Evidence</span>
                {dispute.sellerBankStatementIpfs ? (
                   <span className="text-[#16a34a] font-sans text-sm font-semibold">Submitted ✓</span>
                ) : (
                   <span className="text-[#888] font-sans text-sm">Missing</span>
                )}
             </div>
          </div>
        </div>

        {/* Buyer Info & Evidence */}
        <div className="bg-white p-6 rounded-xl border border-[#e8e8e8] shadow-sm">
          <h2 className="font-condensed text-xl mb-4 border-b border-[#eee] pb-2">Buyer: {dispute.order.buyer?.name || "Unknown"}</h2>
          <div className="flex flex-col gap-4">
             <div>
                <p className="font-sans text-xs text-[#888] font-semibold uppercase mb-1">Statement</p>
                <p className="font-sans text-sm bg-[#f5f5f5] p-3 rounded-lg border border-[#e8e8e8] min-h-[80px]">
                  {dispute.buyerStatement || "No statement provided."}
                </p>
             </div>
             <div className="flex justify-between items-center">
                <span className="font-sans text-sm font-semibold">Bank Statement Evidence</span>
                {dispute.buyerBankStatementIpfs ? (
                   <span className="text-[#16a34a] font-sans text-sm font-semibold">Submitted ✓</span>
                ) : (
                   <span className="text-[#888] font-sans text-sm">Missing</span>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
