"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FollowingCompaniesList } from "@/components/company/following-companies-list";
import { AppShell } from "@/components/layout/app-shell";

export function FollowingCompaniesClient() {
  return (
    <ProtectedRoute allowedRoles={["job_seeker"]}>
      {(user) => (
        <AppShell
          user={user}
          title="Companies I Follow"
          description="Track companies you follow and quickly jump to their active jobs."
        >
          <FollowingCompaniesList />
        </AppShell>
      )}
    </ProtectedRoute>
  );
}
