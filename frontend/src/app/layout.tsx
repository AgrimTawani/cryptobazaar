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
          <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital@1&display=swap" rel="stylesheet" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                document.addEventListener('contextmenu', (e) => e.preventDefault());
                document.addEventListener('keydown', (e) => {
                  if (
                    e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
                    (e.ctrlKey && e.key === 'U') || 
                    (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
                    (e.metaKey && e.shiftKey && (e.key === 'C' || e.key === 'I' || e.key === 'J')) || 
                    (e.metaKey && e.key === 'U') ||
                    (e.ctrlKey && e.key === 'c') ||
                    (e.metaKey && e.key === 'c') ||
                    (e.ctrlKey && e.key === 'C') ||
                    (e.metaKey && e.key === 'C')
                  ) {
                    e.preventDefault();
                  }
                });
                document.addEventListener('copy', (e) => e.preventDefault());
                document.addEventListener('cut', (e) => e.preventDefault());
                document.addEventListener('dragstart', (e) => e.preventDefault());
              `
            }}
          />
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
