import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CB | Sign In",
  description: "Sign in to CryptoBazaar to begin your verification. Only verified members can trade.",
  alternates: { canonical: "https://cryptobazaar.co.in/login" },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
