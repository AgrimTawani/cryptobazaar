"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Home, TrendingUp, Settings, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ConnectButton } from "thirdweb/react";
import { client } from "../client";
import NextImage from "next/image";

export default function ExchangeLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const links = [
    {
      label: "Profile",
      icon: <Home className="h-5 w-5 shrink-0" />,
      href: "/exchange/profile",
    },
    {
      label: "Marketplace",
      icon: <TrendingUp className="h-5 w-5 shrink-0" />,
      href: "/exchange/marketplace",
    },
    {
      label: "Settings",
      icon: <Settings className="h-5 w-5 shrink-0" />,
      href: "/exchange/settings",
    },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/exchange/profile" && pathname === "/exchange") return true;
    return pathname === href;
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        className={cn(
          "flex flex-col bg-neutral-950 border-r border-neutral-800 transition-all duration-300",
          sidebarOpen ? "w-56" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex items-center p-4 border-b border-neutral-800">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-base font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent whitespace-nowrap">
                CryptoBazaar
              </span>
            </div>
          ) : (
            <Sparkles className="w-5 h-5 text-yellow-500 mx-auto" />
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link, idx) => (
            <button
              key={idx}
              onClick={() => router.push(link.href)}
              className={cn(
                "flex items-center w-full px-3 py-2 rounded-lg transition-all",
                isActiveLink(link.href)
                  ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50",
                !sidebarOpen && "justify-center"
              )}
            >
              {link.icon}
              {sidebarOpen && <span className="ml-3 text-sm">{link.label}</span>}
            </button>
          ))}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center w-full px-3 py-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800/50 transition-all",
              !sidebarOpen && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span className="ml-3 text-sm">Logout</span>}
          </button>
        </nav>

        {/* User Profile at Bottom */}
        <div className="p-4 border-t border-neutral-800">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 cursor-pointer",
              !sidebarOpen && "justify-center"
            )}
          >
            <NextImage
              src={user?.imageUrl || "https://avatar.vercel.sh/user"}
              alt={user?.fullName || "User"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border-2 border-yellow-500/30"
            />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.fullName || "User"}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress || ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950/50">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {pathname === "/exchange" || pathname === "/exchange/profile" 
              ? "Profile" 
              : pathname === "/exchange/marketplace"
              ? "Marketplace"
              : pathname === "/exchange/settings"
              ? "Settings"
              : "CryptoBazaar"}
          </h1>
          <ConnectButton
            client={client}
            theme="dark"
            connectButton={{
              label: "Connect Wallet",
              className: "!bg-gradient-to-r !from-yellow-600 !to-orange-600 !font-medium !text-white !rounded-lg !px-6 !py-2 hover:!from-yellow-500 hover:!to-orange-500",
            }}
            detailsButton={{
              className: "!bg-neutral-800 !border !border-neutral-700 !rounded-lg",
            }}
          />
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-black">
          {children}
        </div>
      </main>
    </div>
  );
}
