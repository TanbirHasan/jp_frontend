"use client";

import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AlertsManager } from "@/components/alerts/alerts-manager";
import { AppShell } from "@/components/layout/app-shell";
import type { JobType, User } from "@/lib/types";

const validJobTypes: JobType[] = ["full_time", "part_time", "contract", "remote"];

export function AlertsClient() {
  return (
    <ProtectedRoute allowedRoles={["job_seeker"]}>
      {(user) => <AlertsContent user={user} />}
    </ProtectedRoute>
  );
}

function AlertsContent({ user }: { user: User }) {
  const searchParams = useSearchParams();
  const prefillJobType = searchParams.get("job_type");

  return (
    <AppShell
      user={user}
      title="Job Alerts"
      description="Set a filter once and get notified when a matching job is posted."
    >
      <AlertsManager
        prefill={{
          keywords: searchParams.get("keywords") ?? undefined,
          job_type: validJobTypes.includes(prefillJobType as JobType)
            ? (prefillJobType as JobType)
            : undefined,
          location: searchParams.get("location") ?? undefined,
        }}
      />
    </AppShell>
  );
}
