"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            H
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Hire<span className="text-emerald-600">lane</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                pathname === item.href
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <NotificationPanel />
            <div className="hidden items-center gap-2.5 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-slate-700 to-slate-900 text-xs font-bold uppercase text-white shadow-sm">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-slate-700">{user.name}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isLoggingOut ? "Signing out…" : "Sign out"}
              </span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="flex h-9 items-center rounded-lg px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="flex h-9 items-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
