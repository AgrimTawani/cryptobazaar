"use client";

import { useActiveAccount } from "thirdweb/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function useWalletSync() {
  const account = useActiveAccount();
  const { data: session } = useSession();

  useEffect(() => {
    if (account?.address && session?.user?.email) {
      // Sync wallet address with database
      fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: account.address }),
      }).catch((error) => {
        console.error("Failed to sync wallet address:", error);
      });
    }
  }, [account?.address, session?.user?.email]);
}
