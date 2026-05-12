"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { JobForm } from "@/components/jobs/job-form";
import { AppShell } from "@/components/layout/app-shell";
import type { User } from "@/lib/types";

export function PostJobClient() {
  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      {(user) => <PostJobContent user={user} />}
    </ProtectedRoute>
  );
}

function PostJobContent({ user }: { user: User }) {
  return (
    <AppShell
      user={user}
      title="Post a Job"
      description="Create a role for candidates to discover and apply to."
    >
      <JobForm />
    </AppShell>
  );
}
