import type { ReactNode } from "react";
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
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <span className="inline-flex items-center bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
            {roleLabels[user.role]}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-7xl px-5 py-8 pb-16 sm:px-8 lg:px-10">
        {children}
      </div>
    </main>
  );
}
