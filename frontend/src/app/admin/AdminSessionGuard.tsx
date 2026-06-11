"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminPasswordPrompt } from "./AdminPasswordPrompt";

export function AdminSessionGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("admin_password")) {
      setChecked(true);
    }
  }, []);

  if (!mounted) return null; // Wait for client-side hydration

  if (!checked) {
    return <AdminPasswordPrompt onLogin={() => setChecked(true)} />;
  }

  return <>{children}</>;
}
