import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalUsers,
    pendingUsers,
    totalOrders,
    activeDisputes,
    totalVolumeRow
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "VERIFICATION_PENDING" } }),
    db.order.count(),
    db.dispute.count({ where: { status: { notIn: ["RESOLVED_BUYER", "RESOLVED_SELLER"] } } }),
    db.user.aggregate({ _sum: { totalTradeVolumeInr: true } }),
  ]);

  const totalVolume = Number(totalVolumeRow._sum.totalTradeVolumeInr || 0);

  return (
    <div>
      <h1 className="font-condensed text-3xl mb-8 uppercase tracking-[1px]">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-[#e8e8e8] shadow-sm">
          <p className="font-sans text-[0.7rem] font-bold text-black/60 tracking-[2px] uppercase mb-2">Total Users</p>
          <p className="font-condensed text-[3.5rem] text-black leading-none tracking-wide">{totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#e8e8e8] shadow-sm">
          <p className="font-sans text-[0.7rem] font-bold text-black/60 tracking-[2px] uppercase mb-2">Pending Approvals</p>
          <p className="font-condensed text-[3.5rem] text-[#b45309] leading-none tracking-wide">{pendingUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#e8e8e8] shadow-sm">
          <p className="font-sans text-[0.7rem] font-bold text-black/60 tracking-[2px] uppercase mb-2">Active Disputes</p>
          <p className="font-condensed text-[3.5rem] text-[#991b1b] leading-none tracking-wide">{activeDisputes}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#e8e8e8] shadow-sm">
          <p className="font-sans text-[0.7rem] font-bold text-black/60 tracking-[2px] uppercase mb-2">Total Volume (INR)</p>
          <p className="font-condensed text-[3.5rem] text-[#16a34a] leading-none tracking-wide">₹{totalVolume.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#e8e8e8] shadow-sm">
        <h2 className="font-condensed text-xl mb-4">Quick Actions</h2>
        <div className="flex gap-4">
           {/* Add more quick links if needed */}
           <a href="/admin/users" className="font-condensed text-[1.1rem] uppercase tracking-[1px] bg-[#f5f5f5] hover:bg-[#e5e5e5] transition-colors py-2 px-5 rounded-lg border border-[#e0e0e0] text-[#111] no-underline">Review Pending Users</a>
           <a href="/admin/disputes" className="font-condensed text-[1.1rem] uppercase tracking-[1px] bg-[#f5f5f5] hover:bg-[#e5e5e5] transition-colors py-2 px-5 rounded-lg border border-[#e0e0e0] text-[#111] no-underline">Handle Disputes</a>
        </div>
      </div>
    </div>
  );
}
