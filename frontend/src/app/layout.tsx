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
  title: "CryptoBazaar",
  description:
    "India's only gated P2P stablecoin exchange. Trade USDT and USDC securely with INR. Every member is verified, and every trade is protected by smart contract escrow.",
  keywords: ["P2P crypto exchange India", "buy USDT INR", "sell USDC INR", "secure crypto trading India", "CryptoBazaar", "crypto escrow", "verified P2P trading"],
  authors: [{ name: "CryptoBazaar" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://cryptobazaar.co.in",
    title: "CryptoBazaar | Gated P2P Stablecoin Exchange for India",
    description: "India's only gated P2P stablecoin exchange. Trade USDT and USDC securely with INR. Every member verified, every trade held in escrow.",
    siteName: "CryptoBazaar",
  },
  twitter: {
    card: "summary_large_image",
    title: "CryptoBazaar | Secure P2P Crypto Exchange",
    description: "Trade USDT and USDC safely in India. Verified members only, smart contract escrow on every trade.",
  },
  alternates: {
    canonical: "https://cryptobazaar.co.in",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
