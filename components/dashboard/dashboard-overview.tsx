"use client";

import { useEffect, useState } from "react";
import { applicationsApi, jobsApi } from "@/lib/api";
import type { Application, Job, User } from "@/lib/types";

type DashboardOverviewProps = {
  user: User;
};

export function DashboardOverview({ user }: DashboardOverviewProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetches: Promise<void>[] = [];

    if (user.role === "job_seeker") {
      fetches.push(
        applicationsApi.mine().then(setApplications).catch(() => setApplications([])),
      );
    }

    if (user.role === "employer" || user.role === "admin") {
      fetches.push(
        jobsApi.list().then(setJobs).catch(() => setJobs([])),
      );
    }

    Promise.all(fetches).finally(() => setLoading(false));
  }, [user.role]);

  if (user.role === "job_seeker") {
    const pending = applications.filter((a) => a.status === "pending").length;
    const accepted = applications.filter((a) => a.status === "accepted").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon="📋" label="Total applied" value={loading ? "—" : applications.length} color="slate" />
          <StatCard icon="⏳" label="Pending review" value={loading ? "—" : pending} color="amber" />
          <StatCard icon="✅" label="Accepted" value={loading ? "—" : accepted} color="emerald" />
          <StatCard icon="❌" label="Rejected" value={loading ? "—" : rejected} color="red" />
        </div>
        <QuickActions role="job_seeker" />
      </div>
    );
  }

  if (user.role === "employer") {
    const open = jobs.filter((j) => j.status === "open").length;
    const closed = jobs.filter((j) => j.status === "closed").length;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon="📝" label="Jobs posted" value={loading ? "—" : jobs.length} color="slate" />
          <StatCard icon="🟢" label="Open positions" value={loading ? "—" : open} color="emerald" />
          <StatCard icon="🔒" label="Closed positions" value={loading ? "—" : closed} color="amber" />
        </div>
        <QuickActions role="employer" />
      </div>
    );
  }

  const open = jobs.filter((j) => j.status === "open").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="🌐" label="Platform jobs" value={loading ? "—" : jobs.length} color="slate" />
        <StatCard icon="🟢" label="Open jobs" value={loading ? "—" : open} color="emerald" />
        <StatCard icon="🛡️" label="Access level" value="Full admin" color="violet" />
      </div>
      <QuickActions role="admin" />
    </div>
  );
}

type StatCardProps = {
  icon: string;
  label: string;
  value: string | number;
  color: "slate" | "emerald" | "amber" | "red" | "violet";
};

const colorMap: Record<StatCardProps["color"], string> = {
  slate:   "bg-slate-50 text-slate-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber:   "bg-amber-50 text-amber-600",
  red:     "bg-red-50 text-red-600",
  violet:  "bg-violet-50 text-violet-600",
};

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center text-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const quickActionsByRole: Record<User["role"], { label: string; href: string; primary?: boolean }[]> = {
  job_seeker: [
    { label: "Browse open jobs", href: "/jobs", primary: true },
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
    <div className="bg-white border border-slate-200 p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-700">Quick actions</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {actions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            className={
              action.primary
                ? "inline-flex h-9 items-center bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                : "inline-flex h-9 items-center border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-white transition-colors"
            }
          >
            {action.label}
          </a>
        ))}
      </div>
    </div>
  );
}
