"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { jobsApi } from "@/lib/api";
import type { Job, User } from "@/lib/types";

export function MyJobsClient() {
  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      {(user) => <MyJobsContent user={user} />}
    </ProtectedRoute>
  );
}

function MyJobsContent({ user }: { user: User }) {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    jobsApi.list().then(setJobs).catch(() => setJobs([]));
  }, []);

  async function removeJob(id: string) {
    await jobsApi.remove(id);
    setJobs((current) => current.filter((job) => String(job.id) !== id));
  }

  return (
    <AppShell
      user={user}
      title="My Jobs"
      description="Manage your posted roles, applicants, and job status."
    >
      <div className="mb-5">
        <Link
          href="/jobs/new"
          className="inline-flex h-11 items-center bg-[#161719] px-5 text-sm font-semibold text-white"
        >
          Post a job
        </Link>
      </div>
      <div className="grid gap-4">
        {jobs.length ? (
          jobs.map((job) => (
            <article key={job.id} className="border border-[#dfe5dc] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{job.title}</h2>
                  <p className="mt-1 text-sm text-[#626971]">
                    {job.location} · {job.job_type.replace("_", " ")} · {job.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/jobs/${job.id}/applicants`} className="border border-[#cbd4ca] px-3 py-2 text-sm font-semibold">
                    Applicants
                  </Link>
                  <Link href={`/jobs/${job.id}/edit`} className="border border-[#cbd4ca] px-3 py-2 text-sm font-semibold">
                    Edit
                  </Link>
                  <button onClick={() => removeJob(String(job.id))} className="border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="border border-[#dfe5dc] bg-white p-6 text-sm text-[#626971]">
            You have not posted any jobs yet.
          </p>
        )}
      </div>
    </AppShell>
  );
}
