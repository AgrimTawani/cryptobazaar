import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CryptoBazar",
  keywords: ["thirdweb", "nextjs", "app router", "blockchain", "web3", "crypto"],
  authors: [{ name: "Agrim Tawani"}],
  description:
    "Modern crypto trading platform with secure authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThirdwebProvider>{children}</ThirdwebProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
