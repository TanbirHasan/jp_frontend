"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { adminApi, jobsApi } from "@/lib/api";
import type { Job, User } from "@/lib/types";

export function AdminJobsClient() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {(user) => <AdminJobsContent user={user} />}
    </ProtectedRoute>
  );
}

function AdminJobsContent({ user }: { user: User }) {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    jobsApi.list().then(setJobs).catch(() => setJobs([]));
  }, []);

  async function remove(id: string) {
    await adminApi.removeJob(id);
    setJobs((current) => current.filter((job) => String(job.id) !== id));
  }

  return (
    <AppShell user={user} title="Jobs" description="View and remove jobs across the platform.">
      <div className="grid gap-4">
        {jobs.map((job) => (
          <article key={job.id} className="border border-[#dfe5dc] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{job.title}</h2>
                <p className="mt-1 text-sm text-[#626971]">
                  {job.company_name ?? "Company"} · {job.location} · {job.status}
                </p>
              </div>
              <button
                onClick={() => remove(String(job.id))}
                className="border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
