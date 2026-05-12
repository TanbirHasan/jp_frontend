"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { applicationsApi, jobsApi } from "@/lib/api";
import type { Application, ApplicationStatus, User } from "@/lib/types";

const statuses: ApplicationStatus[] = ["pending", "reviewing", "accepted", "rejected"];

export function ApplicantsClient() {
  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      {(user) => <ApplicantsContent user={user} />}
    </ProtectedRoute>
  );
}

function ApplicantsContent({ user }: { user: User }) {
  const params = useParams<{ id: string }>();
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    jobsApi.applicants(params.id).then(setApplications).catch(() => setApplications([]));
  }, [params.id]);

  async function updateStatus(id: string, status: ApplicationStatus) {
    const updated = await applicationsApi.updateStatus(id, status);
    setApplications((current) =>
      current.map((item) => (String(item.id) === id ? updated : item)),
    );
  }

  return (
    <AppShell user={user} title="Applicants" description="Review and update applicant status.">
      <div className="grid gap-4">
        {applications.length ? (
          applications.map((application) => (
            <article key={application.id} className="border border-[#dfe5dc] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {application.applicant?.name ?? `Applicant #${application.applicant_id}`}
                  </h2>
                  <p className="mt-1 text-sm text-[#626971]">
                    {application.applicant?.email ?? application.resume_url ?? "No contact shown"}
                  </p>
                </div>
                <select
                  value={application.status}
                  onChange={(event) =>
                    updateStatus(String(application.id), event.target.value as ApplicationStatus)
                  }
                  className="h-10 border border-[#d8dde5] bg-white px-3 text-sm"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))
        ) : (
          <p className="border border-[#dfe5dc] bg-white p-6 text-sm text-[#626971]">
            No applicants yet.
          </p>
        )}
      </div>
    </AppShell>
  );
}
