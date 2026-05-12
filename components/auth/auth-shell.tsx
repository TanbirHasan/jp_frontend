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
    <main className="min-h-screen flex">
      {/* Left branding panel */}
      <aside className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between bg-slate-900 p-12 border-r border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center bg-emerald-500 text-white text-sm font-bold">
            H
          </div>
          <span className="text-base font-bold text-white tracking-tight">Hirelane</span>
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
            {eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-white">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-400">
            {description}
          </p>

          <div className="mt-12 grid grid-cols-3 gap-px border border-white/10 bg-white/10">
            <div className="bg-slate-900 px-5 py-5">
              <p className="text-2xl font-bold text-white">12k+</p>
              <p className="mt-1 text-xs text-slate-500">Open roles</p>
            </div>
            <div className="bg-slate-900 px-5 py-5">
              <p className="text-2xl font-bold text-white">800+</p>
              <p className="mt-1 text-xs text-slate-500">Companies</p>
            </div>
            <div className="bg-slate-900 px-5 py-5">
              <p className="text-2xl font-bold text-white">RBAC</p>
              <p className="mt-1 text-xs text-slate-500">Role access</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600">
          © 2025 Hirelane. Tokens stored locally — refresh cookie handled by your backend.
        </p>
      </aside>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-10">
        {/* Mobile logo */}
        <div className="w-full max-w-105">
          <Link href="/" className="lg:hidden mb-10 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center bg-emerald-600 text-white text-sm font-bold">
              H
            </div>
            <span className="text-base font-bold text-slate-900">Hirelane</span>
          </Link>
          {children}
        </div>
      </div>
    </main>
  );
}
