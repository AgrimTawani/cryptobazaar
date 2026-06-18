"use client";

import { ArrowLeft } from "lucide-react";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { WalletNavWidget } from "@/components/WalletNavWidget";

export function ArticleHeader() {
  const { isSignedIn, user } = useUser();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 px-5 md:px-10 h-[64px] flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="nav-logo no-underline text-black"
        >
          CRYPTOBAZAAR
        </Link>
        <span className="text-zinc-200 hidden sm:inline">|</span>
        <span className="font-sans text-xs tracking-[2px] uppercase text-zinc-500 font-bold hidden sm:inline">
          Resources &amp; Legal
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="font-sans text-sm text-[#555] no-underline border border-[#555] rounded-full px-4 py-1.5 hover:bg-[#f5f5f5] transition-colors hidden md:flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <WalletNavWidget />
        {isSignedIn && (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 no-underline py-1 px-3 border border-[#555] rounded-full bg-transparent hover:bg-[#f5f5f5] transition-colors"
            >
              {user?.imageUrl && (
                <Image
                  src={user.imageUrl}
                  alt="User profile picture"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="font-sans text-sm font-semibold text-[#555]">
                Dashboard
              </span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
