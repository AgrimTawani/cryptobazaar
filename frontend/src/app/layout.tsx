import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThirdwebProvider } from "thirdweb/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CryptoBazaar — Gated P2P Stablecoin Exchange for India",
  description:
    "India's only gated P2P stablecoin exchange. Every member verified, every trade held in escrow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital@1&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body className={`${inter.variable}`}>
          <ThirdwebProvider>
            {children}
          </ThirdwebProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
