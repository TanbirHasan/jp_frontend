"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import type { User, UserRole } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";

type ProtectedRouteProps = {
  children: (user: User) => ReactNode;
  allowedRoles?: UserRole[];
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { accessToken, hasHydrated, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    // Token and user already in store — trust local state, no API call needed
    if (accessToken && user) {
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.replace("/dashboard");
        return;
      }
      setIsChecking(false);
      return;
    }

    // No token — attempt session recovery via refresh cookie
    let cancelled = false;

    authApi
      .refreshSession()
      .then(() => authApi.me())
      .then((fetchedUser) => {
        if (cancelled) return;
        if (allowedRoles && !allowedRoles.includes(fetchedUser.role)) {
          router.replace("/dashboard");
          return;
        }
        setIsChecking(false);
      })
      .catch(() => {
        if (!cancelled) {
          useAuthStore.getState().clearAuth();
          router.replace("/login");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, accessToken, user, allowedRoles, router]);

  if (!hasHydrated || isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin border-[3px] border-slate-200 border-t-emerald-600" />
          <p className="text-sm font-medium text-slate-500">Authenticating…</p>
        </div>
      </main>
    );
  }

  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return children(user);
}
