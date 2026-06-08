"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserActions({ userId, currentStatus }: { userId: number; currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateStatus = async (status: string) => {
    if (!confirm(`Are you sure you want to change status to ${status}?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      {currentStatus !== "REJECTED" && (
        <button
          disabled={loading}
          onClick={() => updateStatus("REJECTED")}
          className="font-sans text-sm font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          Reject User
        </button>
      )}
      {currentStatus !== "VERIFIED" && (
        <button
          disabled={loading}
          onClick={() => updateStatus("VERIFIED")}
          className="font-sans text-sm font-semibold bg-lime text-black py-2 px-4 rounded-lg hover:bg-[#a3e635] transition-colors disabled:opacity-50 cursor-pointer"
        >
          Approve User
        </button>
      )}
    </div>
  );
}
