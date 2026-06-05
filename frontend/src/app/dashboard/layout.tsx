import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CB | Dashboard",
  description: "Manage your CryptoBazaar account, view your trades, and access your member dashboard.",
  alternates: { canonical: "https://cryptobazaar.co.in/dashboard" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
