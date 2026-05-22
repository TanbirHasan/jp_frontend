"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertsManager } from "@/components/alerts/alerts-manager";
import { applicationsApi, employersApi, jobsApi } from "@/lib/api";
import type { Application, EmployerStats, Job, User } from "@/lib/types";

type DashboardOverviewProps = {
  user: User;
};

export function DashboardOverview({ user }: DashboardOverviewProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [employerStats, setEmployerStats] = useState<EmployerStats | null>(null);
  const [employerStatsLoading, setEmployerStatsLoading] = useState(true);
  const [employerStatsError, setEmployerStatsError] = useState(false);

  useEffect(() => {
    if (user.role === "job_seeker") {
      applicationsApi
        .mine()
        .then(setApplications)
        .catch(() => setApplications([]))
        .finally(() => setLoading(false));
      return;
    }

    if (user.role === "admin") {
      jobsApi
        .list()
        .then(setJobs)
        .catch(() => setJobs([]))
        .finally(() => setLoading(false));
      return;
    }

    if (user.role === "employer") {
      employersApi
        .stats()
        .then((data) => {
          setEmployerStats(data);
          setEmployerStatsError(false);
        })
        .catch(() => {
          setEmployerStats(null);
          setEmployerStatsError(true);
        })
        .finally(() => setEmployerStatsLoading(false));
    }
  }, [user.role]);

  if (user.role === "job_seeker") {
    const pending = applications.filter((a) => a.status === "pending").length;
    const accepted = applications.filter((a) => a.status === "accepted").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Applied" value={loading ? "-" : applications.length} color="slate" />
          <StatCard label="Pending Review" value={loading ? "-" : pending} color="amber" />
          <StatCard label="Accepted" value={loading ? "-" : accepted} color="emerald" />
          <StatCard label="Rejected" value={loading ? "-" : rejected} color="red" />
        </div>
        <QuickActions role="job_seeker" />
        <AlertsManager
          title="Job Alerts"
          description="Create alerts once and get notified when matching jobs are posted."
        />
      </div>
    );
  }

  if (user.role === "employer") {
    return (
      <div className="space-y-6">
        <EmployerStatsSection
          loading={employerStatsLoading}
          error={employerStatsError}
          stats={employerStats}
        />
        <QuickActions role="employer" />
      </div>
    );
  }

  const open = jobs.filter((j) => j.status === "open").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Platform Jobs" value={loading ? "-" : jobs.length} color="slate" />
        <StatCard label="Open Jobs" value={loading ? "-" : open} color="emerald" />
        <StatCard label="Access Level" value="Full admin" color="violet" />
      </div>
      <QuickActions role="admin" />
    </div>
  );
}

function EmployerStatsSection({
  loading,
  error,
  stats,
}: {
  loading: boolean;
  error: boolean;
  stats: EmployerStats | null;
}) {
  if (error) {
    return (
      <p className="border border-slate-200 bg-white p-5 text-sm text-slate-600">
        Could not load stats.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse border border-slate-200 bg-white p-6" />
        ))}
      </div>
    );
  }

  const normalized: EmployerStats = stats ?? {
    total_jobs_posted: 0,
    open_jobs: 0,
    total_applications_received: 0,
    applications_this_week: 0,
    most_applied_job: null,
  };
  const safeStats: EmployerStats = {
    total_jobs_posted: Number(normalized.total_jobs_posted ?? 0),
    open_jobs: Number(normalized.open_jobs ?? 0),
    total_applications_received: Number(normalized.total_applications_received ?? 0),
    applications_this_week: Number(normalized.applications_this_week ?? 0),
    most_applied_job: normalized.most_applied_job ?? null,
  };

  const isEmpty =
    safeStats.total_jobs_posted === 0 &&
    safeStats.open_jobs === 0 &&
    safeStats.total_applications_received === 0 &&
    safeStats.applications_this_week === 0 &&
    safeStats.most_applied_job === null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Jobs" value={safeStats.total_jobs_posted} color="slate" />
        <StatCard label="Open Jobs" value={safeStats.open_jobs} color="emerald" />
        <StatCard label="Total Apps" value={safeStats.total_applications_received} color="amber" />
        <StatCard label="Apps This Week" value={safeStats.applications_this_week} color="violet" />
        <MostAppliedJobCard stats={safeStats} />
      </div>
      {isEmpty ? (
        <div className="border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Post your first job to see analytics.
        </div>
      ) : null}
    </div>
  );
}

function MostAppliedJobCard({ stats }: { stats: EmployerStats }) {
  if (!stats.most_applied_job) {
    return (
      <div className="border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Most Applied Job</p>
        <p className="mt-3 text-sm font-semibold text-slate-700">No jobs posted yet</p>
      </div>
    );
  }

  return (
    <Link
      href={`/jobs/${stats.most_applied_job.id}/applicants`}
      className="border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-300"
    >
      <p className="text-sm font-medium text-slate-500">Most Applied Job</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{stats.most_applied_job.title}</p>
      <p className="mt-1 text-sm text-slate-600">
        {stats.most_applied_job.count} applications
      </p>
    </Link>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  color: "slate" | "emerald" | "amber" | "red" | "violet";
};

const colorMap: Record<StatCardProps["color"], string> = {
  slate: "bg-slate-50 text-slate-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  violet: "bg-violet-50 text-violet-600",
};

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center text-xs font-bold uppercase ${colorMap[color]}`}>
          {label.split(" ")[0]}
        </div>
      </div>
    </div>
  );
}

const quickActionsByRole: Record<User["role"], { label: string; href: string; primary?: boolean }[]> = {
  job_seeker: [
    { label: "Browse open jobs", href: "/jobs", primary: true },
    { label: "Following companies", href: "/following-companies" },
    { label: "My applications", href: "/applications" },
    { label: "Edit profile", href: "/profile" },
  ],
  employer: [
    { label: "Post a new job", href: "/jobs/new", primary: true },
    { label: "Manage my jobs", href: "/my-jobs" },
    { label: "Company profile", href: "/company" },
  ],
  admin: [
    { label: "Manage users", href: "/admin/users", primary: true },
    { label: "Manage jobs", href: "/admin/jobs" },
  ],
};

function QuickActions({ role }: { role: User["role"] }) {
  const actions = quickActionsByRole[role];
  return (
    <div className="border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-700">Quick actions</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {actions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            className={
              action.primary
                ? "inline-flex h-9 items-center bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                : "inline-flex h-9 items-center border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
            }
          >
            {action.label}
          </a>
        ))}
      </div>
    </div>
  );
}
