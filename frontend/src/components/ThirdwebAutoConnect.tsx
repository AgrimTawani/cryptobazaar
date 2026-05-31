"use client";

import { AutoConnect } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { thirdwebClient } from "@/lib/thirdweb";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("walletConnect"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
];

export function ThirdwebAutoConnect() {
  return <AutoConnect client={thirdwebClient} wallets={wallets} />;
}
