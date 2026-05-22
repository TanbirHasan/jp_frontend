"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { authApi } from "@/lib/api";
import { navByRole, publicNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = !!(accessToken && user);
  const navItems = isAuthenticated && user ? navByRole[user.role] : publicNavItems;

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
      router.replace("/");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center bg-emerald-600 text-sm font-bold tracking-tight text-white">
            H
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">Hirelane</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "text-slate-900 after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:bg-emerald-600"
                  : "text-slate-500 hover:text-slate-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <NotificationPanel />
            <div className="hidden items-center gap-2.5 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center bg-slate-900 text-xs font-bold uppercase text-white">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-slate-600">{user.name}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="h-9 border border-slate-200 px-4 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link
              href="/login"
              className="flex h-9 items-center px-4 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="flex h-9 items-center bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
