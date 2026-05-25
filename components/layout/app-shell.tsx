"use client";

import {
  Menu,
  X,
  LayoutDashboard,
  Briefcase,
  Bell,
  Building2,
  FileText,
  User,
  FolderOpen,
  PlusCircle,
  Building,
  Users,
  Shield,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { navByRole } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/lib/types";

const roleLabels: Record<UserType["role"], string> = {
  job_seeker: "Job Seeker",
  employer: "Employer",
  admin: "Administrator",
};

const roleColors: Record<UserType["role"], string> = {
  job_seeker: "bg-blue-100 text-blue-700",
  employer: "bg-emerald-100 text-emerald-700",
  admin: "bg-violet-100 text-violet-700",
};

const navIconMap: Record<string, React.FC<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/jobs": Briefcase,
  "/tracker": ClipboardList,
  "/jobs/new": PlusCircle,
  "/alerts": Bell,
  "/following-companies": Building2,
  "/applications": FileText,
  "/profile": User,
  "/my-jobs": FolderOpen,
  "/company": Building,
  "/admin/users": Users,
  "/admin/jobs": Shield,
};

type AppShellProps = {
  user: UserType;
  title: string;
  description?: string;
  children: ReactNode;
};

export function AppShell({ user, title, description, children }: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navItems = navByRole[user.role];

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col p-4">
        {/* User info card */}
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                roleColors[user.role],
              )}
            >
              {roleLabels[user.role]}
            </span>
          </div>
        </div>

        <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Workspace
        </p>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = navIconMap[item.href] ?? ChevronRight;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600",
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl gap-0 px-0 sm:px-6 lg:px-8">
        {/* Desktop Sidebar */}
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-64 shrink-0 md:block">
          <div className="h-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SidebarContent />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Page header */}
          {title || description ? (
            <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
              <div className="px-5 py-6 sm:px-8 lg:px-10">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    {title ? (
                      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
                    ) : null}
                    {description ? (
                      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
                        {description}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
                    aria-label="Open dashboard menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {!title && !description ? (
            <div className="flex justify-end px-5 pt-5 sm:px-8 lg:px-10 md:hidden">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                aria-label="Open dashboard menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          ) : null}

          <div className="px-5 py-8 pb-16 sm:px-8 lg:px-10">{children}</div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen ? (
        <div className="fixed inset-0 z-60 md:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            aria-label="Close dashboard menu"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white">
                  H
                </div>
                <span className="font-bold text-slate-900">
                  Hire<span className="text-emerald-600">lane</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                aria-label="Close dashboard menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="h-[calc(100%-61px)] overflow-y-auto">
              <SidebarContent />
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
