"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import type { User } from "@/lib/types";

type NavItem = { href: string; label: string };

const publicNavItems: NavItem[] = [
  { href: "/jobs", label: "Browse Jobs" },
];

const navByRole: Record<User["role"], NavItem[]> = {
  job_seeker: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/jobs", label: "Jobs" },
    { href: "/applications", label: "Applications" },
    { href: "/profile", label: "Profile" },
  ],
  employer: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/my-jobs", label: "My Jobs" },
    { href: "/jobs/new", label: "Post Job" },
    { href: "/company", label: "Company" },
    { href: "/profile", label: "Profile" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/jobs", label: "Jobs" },
    { href: "/profile", label: "Profile" },
  ],
};

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center bg-emerald-600 text-white text-sm font-bold tracking-tight">
            H
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Hirelane
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-0.5">
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

        {/* Auth actions */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <NotificationPanel />
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center bg-slate-900 text-white text-xs font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-slate-600">{user.name}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="h-9 border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link
              href="/login"
              className="h-9 px-4 flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="h-9 bg-emerald-600 px-4 flex items-center text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
