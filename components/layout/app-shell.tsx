"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { navByRole } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

const roleLabels: Record<User["role"], string> = {
  job_seeker: "Job Seeker",
  employer: "Employer",
  admin: "Administrator",
};

type AppShellProps = {
  user: User;
  title: string;
  description?: string;
  children: ReactNode;
};

export function AppShell({ user, title, description, children }: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navItems = navByRole[user.role];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl gap-0 px-0 sm:px-6 lg:px-8">
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-64 shrink-0 border-r border-slate-200 bg-white md:block">
          <div className="h-full overflow-y-auto p-4">
            <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </p>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-b border-slate-200 bg-white">
            <div className="px-5 py-5 sm:px-8 lg:px-10">
              <div className="mb-4 flex items-center justify-between md:mb-0">
                <span className="inline-flex items-center bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {roleLabels[user.role]}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 md:hidden"
                  aria-label="Open dashboard menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h1>
              {description ? (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="px-5 py-8 pb-16 sm:px-8 lg:px-10">{children}</div>
        </div>
      </div>

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close dashboard menu"
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">Dashboard Menu</p>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100"
                aria-label="Close dashboard menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="space-y-1.5 p-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
