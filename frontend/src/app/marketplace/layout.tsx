import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CB | Marketplace",
  description: "Buy and sell USDT safely in India. Verified members only, smart contract escrow on every trade.",
  alternates: { canonical: "https://cryptobazaar.co.in/marketplace" },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
