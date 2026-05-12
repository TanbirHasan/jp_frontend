"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { JobForm } from "@/components/jobs/job-form";
import { AppShell } from "@/components/layout/app-shell";
import { jobsApi } from "@/lib/api";
import type { Job, User } from "@/lib/types";

export function EditJobClient() {
  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      {(user) => <EditJobContent user={user} />}
    </ProtectedRoute>
  );
}

function EditJobContent({ user }: { user: User }) {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null | undefined>(undefined);

  useEffect(() => {
    jobsApi
      .list()
      .then((jobs) => setJob(jobs.find((item) => String(item.id) === params.id) ?? null))
      .catch(() => setJob(null));
  }, [params.id]);

  return (
    <AppShell user={user} title="Edit Job" description="Update job details and status.">
      {job === undefined ? (
        <p className="border border-[#dfe5dc] bg-white p-6 text-sm text-[#626971]">
          Loading job...
        </p>
      ) : job ? (
        <JobForm job={job} />
      ) : (
        <p className="border border-[#dfe5dc] bg-white p-6 text-sm text-[#626971]">
          Job not found.
        </p>
      )}
    </AppShell>
  );
}
