"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { applicationsApi } from "@/lib/api";
import type { Application, User } from "@/lib/types";

export function ApplicationsClient() {
  return (
    <ProtectedRoute allowedRoles={["job_seeker"]}>
      {(user) => <ApplicationsContent user={user} />}
    </ProtectedRoute>
  );
}

function ApplicationsContent({ user }: { user: User }) {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    applicationsApi.mine().then(setApplications).catch(() => setApplications([]));
  }, []);

  return (
    <AppShell
      user={user}
      title="My Applications"
      description="Track every job you have applied to and follow status changes."
    >
      <div className="grid gap-4">
        {applications.length ? (
          applications.map((application) => (
            <article key={application.id} className="border border-[#dfe5dc] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    {application.job_title ?? application.job?.title ?? `Job #${application.job_id}`}
                  </h2>
                  <p className="mt-1 text-sm text-[#626971]">
                    {application.company_name ? `${application.company_name} · ` : ""}
                    {application.location ?? "Location not listed"} · Applied{" "}
                    {application.applied_at ?? "recently"}
                  </p>
                </div>
                <span className="bg-[#e8f0df] px-3 py-1 text-xs font-bold uppercase text-[#4f663b]">
                  {application.status}
                </span>
              </div>
            </article>
          ))
        ) : (
          <EmptyState text="You have not applied to any jobs yet." />
        )}
      </div>
    </AppShell>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="border border-[#dfe5dc] bg-white p-6 text-sm text-[#626971]">{text}</p>;
}
