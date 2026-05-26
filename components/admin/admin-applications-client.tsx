"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { adminApi } from "@/lib/api";
import type { Application, User } from "@/lib/types";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  reviewing: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminApplicationsClient() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {(user) => <AdminApplicationsContent currentUser={user} />}
    </ProtectedRoute>
  );
}

function AdminApplicationsContent({ currentUser }: { currentUser: User }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    adminApi
      .applications()
      .then(setApplications)
      .catch(() => {
        setApplications([]);
        toast.error("Failed to load applications.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteApplication(String(deleteTarget.id));
      setApplications((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success("Application deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete application.");
    } finally {
      setDeleteLoading(false);
    }
  }

  const applicantName = (a: Application) =>
    a.applicant_name ?? a.applicant?.name ?? `User #${a.applicant_id}`;
  const applicantEmail = (a: Application) =>
    a.applicant_email ?? a.applicant?.email ?? "—";
  const jobTitle = (a: Application) =>
    a.job_title ?? a.job?.title ?? `Job #${a.job_id}`;
  const companyName = (a: Application) =>
    a.company_name ?? a.job?.company_name ?? a.job?.company?.name ?? "—";

  return (
    <AppShell
      user={currentUser}
      title="Applications"
      description="View and remove job applications across the platform."
    >
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No applications found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Applicant</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Job Title</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Company</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Applied At</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {applicantName(app)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{applicantEmail(app)}</td>
                  <td className="px-4 py-3 text-slate-700">{jobTitle(app)}</td>
                  <td className="px-4 py-3 text-slate-500">{companyName(app)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        statusBadge[app.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(app.applied_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(app)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete application"
          message={`Are you sure you want to delete this application by "${applicantName(deleteTarget)}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </AppShell>
  );
}
