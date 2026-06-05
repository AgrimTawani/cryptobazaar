"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { WalletNavWidget } from "@/components/WalletNavWidget";

export function ArticleHeader() {
  const { isSignedIn, user } = useUser();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 px-5 md:px-10 h-16 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="font-condensed text-[1.6rem] tracking-[3px] text-black hover:text-lime-dark transition-colors duration-200"
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
          className="font-sans text-sm text-zinc-500 hover:text-black transition-colors duration-200 no-underline hidden md:inline"
        >
          Home
        </Link>
        <span className="text-zinc-200 hidden md:inline">·</span>
        <WalletNavWidget />
        <span className="text-zinc-200 hidden md:inline">·</span>
        {isSignedIn ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 no-underline py-1.5 pr-3.5 pl-1.5 border border-zinc-200 rounded-full bg-zinc-50 hover:bg-zinc-100 transition-colors"
          >
            {user?.imageUrl && (
              <img
                src={user.imageUrl}
                alt=""
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span className="font-sans text-sm font-medium text-zinc-800">
              Dashboard
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="btn-login py-1 px-5 border border-zinc-300 rounded-full text-zinc-800 font-condensed hover:bg-black hover:text-white transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
