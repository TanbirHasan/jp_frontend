"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export function DashboardClient() {
  return (
    <ProtectedRoute>
      {(user) => (
        <AppShell
          user={user}
          title="Dashboard"
          description="A role-aware starting point for your job portal workflow."
        >
          <DashboardOverview user={user} />
        </AppShell>
      )}
    </ProtectedRoute>
  );
}
