"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminPasswordPrompt() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.refresh(); // Refresh the layout to re-evaluate the cookie on the server
      } else {
        const data = await res.json();
        setError(data.error || "Invalid password");
      }
    } catch (err) {
      setError("Failed to verify password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <div className="bg-white p-8 rounded-xl border border-[#e8e8e8] shadow-sm max-w-sm w-full">
        <h2 className="font-condensed text-2xl tracking-[1px] mb-2">Admin Access</h2>
        <p className="font-sans text-sm text-[#888] mb-6">Enter the secondary admin password to proceed.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full font-mono text-sm border border-[#e5e5e5] rounded-lg px-3 py-2.5 outline-none focus:border-black transition-colors"
              autoFocus
            />
          </div>
          {error && <p className="font-sans text-xs text-red-600 font-semibold">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-black text-white font-sans text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}
