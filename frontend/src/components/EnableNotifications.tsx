"use client";

import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

interface Props {
  variant?: "banner" | "inline";
}

export function EnableNotifications({ variant = "banner" }: Props) {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [blockedHint, setBlockedHint] = useState(false);

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    const perm = Notification.permission;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPermission(perm);
    if (perm === "granted") {
      navigator.serviceWorker.register("/sw.js").then(async (reg) => {
        await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        const sub = existing ?? await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });
        await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        });
      }).catch((err) => console.error("[EnableNotifications] auto-subscribe", err));
    }
  }, []);

  if (permission === null || dismissed) return null;

  if (permission === "granted") {
    if (variant === "inline") {
      return (
        <span className="flex items-center gap-1.5 text-xs text-[#22c55e]">
          <span className="text-base">🔔</span>
          <span>Alerts on</span>
        </span>
      );
    }
    return null;
  }

  async function enable() {
    if (permission === "denied") { setBlockedHint(true); return; }
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") { setBlockedHint(true); return; }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const existing = await reg.pushManager.getSubscription();
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
    } catch (err) {
      console.error("[EnableNotifications]", err);
    } finally {
      setLoading(false);
    }
  }

  if (variant === "inline") {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={enable}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#111] transition-colors disabled:opacity-50"
        >
          <span className="text-base">🔔</span>
          <span>{loading ? "Enabling…" : "Enable alerts"}</span>
        </button>
        {blockedHint && (
          <p className="text-xs text-[#dc2626]">Click 🔒 in address bar <ArrowRight className="inline-block w-4 h-4 ml-1" /> Notifications <ArrowRight className="inline-block w-4 h-4 ml-1" /> Allow</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#fffbe6] border border-[#f5d000] rounded-xl px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔔</span>
          <div>
            <p className="text-sm font-semibold text-[#111]">Enable trade notifications</p>
            <p className="text-xs text-[#666]">Get instant alerts when buyers lock your order or payments are submitted</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={enable}
            disabled={loading}
            className="bg-[#111] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            {loading ? "Enabling…" : "Enable"}
          </button>
          <button onClick={() => setDismissed(true)} className="text-[#aaa] hover:text-[#666] text-lg leading-none" aria-label="Dismiss">×</button>
        </div>
      </div>
      {blockedHint && (
        <p className="mt-2 text-xs text-[#dc2626] font-medium">
          🔒 Blocked by browser — click the lock icon in your address bar <ArrowRight className="inline-block w-4 h-4 ml-1" /> Notifications <ArrowRight className="inline-block w-4 h-4 ml-1" /> Allow, then refresh.
        </p>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
