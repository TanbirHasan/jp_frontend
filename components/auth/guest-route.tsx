"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

type GuestRouteProps = {
  children: ReactNode;
};

export function GuestRoute({ children }: GuestRouteProps) {
  const router = useRouter();
  const { accessToken, user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (accessToken && user) {
      router.replace("/dashboard");
    }
  }, [hasHydrated, accessToken, user, router]);

  // Render nothing until hydrated to avoid flashing the auth page
  if (!hasHydrated) return null;

  // Already logged in — redirect is in flight
  if (accessToken && user) return null;

  return <>{children}</>;
}
