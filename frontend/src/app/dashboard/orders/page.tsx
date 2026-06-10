"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";

function activityBadge(status: string) {
  if (status === "COMPLETED") return "bg-[#e8f5e9] text-[#2e7d32]";
  if (status === "CANCELLED" || status === "EXPIRED") return "bg-[#ffebee] text-[#c62828]";
  if (status.includes("DISPUTE")) return "bg-[#fff3e0] text-[#e65100]";
  return "bg-[#f5f5f5] text-[#888]";
}

interface OrderRow {
  id: string;
  role: string;
  action: string;
  amount: string;
  asset: string;
  totalValueInr: string;
  status: string;
  statusLabel: string;
  counterpartyName: string | null;
  updatedAt: string;
}

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/orders")
      .then(res => res.json())
      .then(data => {
        if (data.activity) setOrders(data.activity);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <TopNav />
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-16 sm:mt-0">
        <div className="mb-6">
          <Link href="/dashboard" className="font-sans text-sm text-[#888] no-underline hover:text-[#111]">
            ← Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
          <div className="mb-6">
            <h1 className="font-condensed text-[2.5rem] tracking-[0.5px] leading-none mb-2">Order History</h1>
            <p className="font-sans text-sm text-[#666]">All your recent and past transactions.</p>
          </div>

          {loading ? (
            <div className="py-10 flex justify-center">
              <div className="w-6 h-6 border-2 border-[#e8e8e8] border-t-black rounded-full animate-spin" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-10">
              <p className="font-sans text-sm text-[#bbb]">No orders found.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#f5f5f5]">
              {orders.map((row) => (
                <Link key={row.id} href={`/marketplace/${row.id}`}
                  className="flex items-center justify-between py-4 no-underline hover:bg-[#fafafa] -mx-2 px-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-sans text-base font-semibold text-[#111]">
                      {row.action} {parseFloat(row.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })} {row.asset}
                    </p>
                    <p className="font-sans text-sm text-[#888] mt-1">
                      {row.counterpartyName ? `${row.role === "seller" ? "Buyer" : "Seller"}: ${row.counterpartyName} · ` : ""}
                      ₹{parseFloat(row.totalValueInr).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                    <p className="font-sans text-xs text-[#aaa] mt-1">
                      {new Date(row.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`font-sans text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${activityBadge(row.status)}`}>
                    {row.statusLabel}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
