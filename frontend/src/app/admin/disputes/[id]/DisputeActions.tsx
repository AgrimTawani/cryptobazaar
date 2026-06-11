"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DisputeActions({ disputeId, currentStatus }: { disputeId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const resolveDispute = async (action: "SELLER" | "BUYER") => {
    const confirmMsg = action === "SELLER" 
      ? "Are you sure? This will cancel the contract and refund the seller." 
      : "Are you sure? This will release the funds to the buyer.";
      
    if (!confirm(confirmMsg)) return;
    
    setLoading(true);
    try {
      const pwd = sessionStorage.getItem("admin_password");
      const res = await fetch(`/api/admin/disputes/${disputeId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${pwd || ""}`
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to resolve dispute");
      }
    } catch (err) {
      console.error(err);
      alert("Error resolving dispute");
    } finally {
      setLoading(false);
    }
  };

  const isResolved = currentStatus === "RESOLVED_BUYER" || currentStatus === "RESOLVED_SELLER";

  return (
    <div className="flex gap-3">
      {!isResolved && (
        <>
          <button
            disabled={loading}
            onClick={() => resolveDispute("SELLER")}
            className="font-sans text-sm font-semibold bg-white border border-[#e5e5e5] text-[#111] hover:bg-[#f5f5f5] py-2 px-4 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Refund Seller
          </button>
          <button
            disabled={loading}
            onClick={() => resolveDispute("BUYER")}
            className="font-sans text-sm font-semibold bg-black text-white py-2 px-4 rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Release to Buyer
          </button>
        </>
      )}
      {isResolved && (
        <span className="font-sans text-sm font-semibold text-[#16a34a] bg-[#f0fdf4] px-4 py-2 rounded-lg border border-[#bbf7d0]">
          Resolved
        </span>
      )}
    </div>
  );
}
