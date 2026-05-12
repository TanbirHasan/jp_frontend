"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { CompanyForm } from "@/components/company/company-form";
import { AppShell } from "@/components/layout/app-shell";

export function CompanyClient() {
  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      {(user) => (
        <AppShell
          user={user}
          title="Company Setup"
          description="Create your company profile. If one already exists, the API will prevent duplicates."
        >
          <CompanyForm />
        </AppShell>
      )}
    </ProtectedRoute>
  );
}
