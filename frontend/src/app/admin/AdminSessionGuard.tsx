"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminSessionGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem("admin_session_active")) {
      // The tab was closed, or it's a new tab without session storage.
      // Clear the cookie so the user is forced to log in.
      fetch("/api/admin/logout", { method: "POST" }).then(() => {
        window.location.href = "/admin/login";
      });
    } else {
      setChecked(true);
    }
  }, []);

  if (!checked) return null; // Prevent flash of protected content

  return <>{children}</>;
}
