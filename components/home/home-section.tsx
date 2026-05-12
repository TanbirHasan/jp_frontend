"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

const roleLabels = {
  job_seeker: "Job seeker",
  employer: "Employer",
  admin: "Admin",
};

export function HomeSection() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await authApi.logout();
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8faf7] text-[#161719]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex h-16 items-center justify-between border-b border-[#dfe5dc]">
          <Link href="/" className="text-base font-semibold tracking-wide">
            Hirelane
          </Link>

          <nav className="flex items-center gap-3">
            {hasHydrated && user ? (
              <>
                <span className="hidden text-sm text-[#5d656d] sm:inline">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="h-10 border border-[#cbd4ca] px-4 text-sm font-semibold transition hover:border-[#161719] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-10 px-4 pt-2.5 text-sm font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="h-10 bg-[#161719] px-4 pt-2.5 text-sm font-semibold text-white transition hover:bg-[#303235]"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#677952]">
              Job Board API Frontend
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              Find better roles and manage hiring from one focused workspace.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#626971] sm:text-lg">
              A production-minded Next.js 16 interface for your Express job
              portal API, starting with secure registration, login, refresh, and
              logout flows.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {hasHydrated && user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex h-12 items-center justify-center bg-[#161719] px-6 text-sm font-semibold text-white transition hover:bg-[#303235]"
                  >
                    Go to dashboard
                  </Link>
                  <span className="inline-flex h-12 items-center justify-center border border-[#cbd4ca] px-6 text-sm font-semibold text-[#3d444b]">
                    {roleLabels[user.role]}
                  </span>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex h-12 items-center justify-center bg-[#161719] px-6 text-sm font-semibold text-white transition hover:bg-[#303235]"
                  >
                    Start now
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-12 items-center justify-center border border-[#cbd4ca] px-6 text-sm font-semibold transition hover:border-[#161719]"
                  >
                    I already have an account
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="border border-[#dfe5dc] bg-white p-5 shadow-[0_30px_80px_rgba(49,60,43,0.12)]">
            <div className="border-b border-[#edf0eb] pb-4">
              <p className="text-sm font-semibold text-[#677952]">
                Current session
              </p>
            </div>
            <div className="space-y-5 py-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[#626971]">Status</span>
                <span className="text-sm font-semibold">
                  {hasHydrated && user ? "Authenticated" : "Guest"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[#626971]">Role</span>
                <span className="text-sm font-semibold">
                  {hasHydrated && user ? roleLabels[user.role] : "Public"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[#626971]">Access token</span>
                <span className="text-sm font-semibold">
                  {hasHydrated && user ? "Stored locally" : "Not issued"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[#626971]">Refresh token</span>
                <span className="text-sm font-semibold">
                  Backend httpOnly cookie
                </span>
              </div>
            </div>
            <div className="bg-[#f4f7f2] p-4 text-sm leading-6 text-[#59615b]">
              The axios client attaches the bearer token, refreshes on a 401,
              retries the original request, and clears local auth on refresh
              failure.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
