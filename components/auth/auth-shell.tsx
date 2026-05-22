import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen">
      {/* Left branding panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 p-12 lg:flex lg:w-[45%] xl:w-[42%]">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white shadow-lg">
            H
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Hire<span className="text-emerald-400">lane</span>
          </span>
        </Link>

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-white">{title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-400">{description}</p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { value: "12k+", label: "Open roles" },
              { value: "800+", label: "Companies" },
              { value: "RBAC", label: "Role access" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-2.5">
            {[
              "Apply to jobs in seconds",
              "Track every application in real time",
              "Get matched with top employers",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <p className="text-sm text-slate-400">{feat}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-700">© 2025 Hirelane. Secure by design.</p>
      </aside>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white">
              H
            </div>
            <span className="text-base font-bold text-slate-900">
              Hire<span className="text-emerald-600">lane</span>
            </span>
          </Link>
          {children}
        </div>
      </div>
    </main>
  );
}
