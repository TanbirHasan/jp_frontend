"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Search,
  Building2,
  FileText,
  User,
  PlusCircle,
  FolderOpen,
  Building,
  Shield,
  Star,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { AlertsManager } from "@/components/alerts/alerts-manager";
import { applicationsApi, employersApi, jobsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Application, EmployerStats, Job, User as UserType } from "@/lib/types";

type DashboardOverviewProps = {
  user: UserType;
};

const roleLabels: Record<UserType["role"], string> = {
  job_seeker: "Job Seeker",
  employer: "Employer",
  admin: "Administrator",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function WelcomeBanner({ user }: { user: UserType }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
      <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 left-1/3 h-36 w-36 rounded-full bg-blue-500/10 blur-2xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{getGreeting()},</p>
          <h2 className="mt-0.5 text-2xl font-bold text-white">{user.name}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 ring-1 ring-emerald-500/30">
          {roleLabels[user.role]}
        </span>
      </div>
    </div>
  );
}

type StatCardColor = "slate" | "emerald" | "amber" | "red" | "violet" | "blue";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.FC<{ className?: string }>;
  color: StatCardColor;
  loading?: boolean;
};

const colorConfig: Record<
  StatCardColor,
  {
    card: string;
    accent: string;
    iconBg: string;
    iconColor: string;
    value: string;
    label: string;
  }
> = {
  slate: {
    card: "border-slate-200 hover:border-slate-300",
    accent: "bg-slate-800",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    value: "text-slate-900",
    label: "text-slate-500",
  },
  emerald: {
    card: "border-emerald-100 hover:border-emerald-200",
    accent: "bg-emerald-500",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    value: "text-slate-900",
    label: "text-emerald-600",
  },
  amber: {
    card: "border-amber-100 hover:border-amber-200",
    accent: "bg-amber-400",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    value: "text-slate-900",
    label: "text-amber-600",
  },
  red: {
    card: "border-red-100 hover:border-red-200",
    accent: "bg-red-500",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    value: "text-slate-900",
    label: "text-red-600",
  },
  violet: {
    card: "border-violet-100 hover:border-violet-200",
    accent: "bg-violet-500",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    value: "text-slate-900",
    label: "text-violet-600",
  },
  blue: {
    card: "border-blue-100 hover:border-blue-200",
    accent: "bg-blue-500",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    value: "text-slate-900",
    label: "text-blue-600",
  },
};

function StatCard({ label, value, icon: Icon, color, loading }: StatCardProps) {
  const cfg = colorConfig[color];

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 skeleton" />
        <div className="skeleton mb-3 h-12 w-12 rounded-xl" />
        <div className="skeleton h-8 w-16 rounded-lg" />
        <div className="skeleton mt-2 h-4 w-24 rounded-md" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        cfg.card,
      )}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${cfg.accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            cfg.iconBg,
          )}
        >
          <Icon className={cn("h-6 w-6", cfg.iconColor)} />
        </div>
        <p className={cn("text-4xl font-extrabold tracking-tight", cfg.value)}>{value}</p>
      </div>
      <p className={cn("mt-3 text-sm font-semibold", cfg.label)}>{label}</p>
    </div>
  );
}

const quickActionsByRole: Record<
  UserType["role"],
  { label: string; href: string; primary?: boolean; icon: React.FC<{ className?: string }> }[]
> = {
  job_seeker: [
    { label: "Browse Jobs", href: "/jobs", primary: true, icon: Search },
    { label: "Following", href: "/following-companies", icon: Building2 },
    { label: "Applications", href: "/applications", icon: FileText },
    { label: "Edit Profile", href: "/profile", icon: User },
  ],
  employer: [
    { label: "Post a Job", href: "/jobs/new", primary: true, icon: PlusCircle },
    { label: "My Jobs", href: "/my-jobs", icon: FolderOpen },
    { label: "Company", href: "/company", icon: Building },
  ],
  admin: [
    { label: "Manage Users", href: "/admin/users", primary: true, icon: Users },
    { label: "Manage Jobs", href: "/admin/jobs", icon: Shield },
  ],
};

function QuickActions({ role }: { role: UserType["role"] }) {
  const actions = quickActionsByRole[role];
  const colsClass =
    actions.length <= 2
      ? "grid-cols-2"
      : actions.length === 3
        ? "grid-cols-3"
        : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
        Quick Actions
      </h3>
      <div className={cn("mt-4 grid gap-3", colsClass)}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "group flex flex-col items-center gap-2.5 rounded-xl p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                action.primary
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200/60 hover:bg-emerald-700"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
              )}
            >
              <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-xs font-semibold leading-tight">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function MostAppliedJobCard({ stats }: { stats: EmployerStats }) {
  if (!stats.most_applied_job) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-slate-200" />
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
          <Star className="h-6 w-6 text-slate-300" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-400">Most Applied Job</p>
        <p className="mt-1 text-sm text-slate-400">No data yet</p>
      </div>
    );
  }

  return (
    <Link
      href={`/jobs/${stats.most_applied_job.id}/applicants`}
      className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 transition-transform duration-300 group-hover:scale-110">
        <Star className="h-6 w-6 text-emerald-600" />
      </div>
      <p className="mt-3 text-sm font-semibold text-emerald-600">Most Applied Job</p>
      <p className="mt-1 text-base font-bold text-slate-900 line-clamp-1">
        {stats.most_applied_job.title}
      </p>
      <p className="mt-0.5 text-sm text-slate-500">{stats.most_applied_job.count} applications</p>
      <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
        View applicants <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
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
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
        Could not load stats. Please refresh.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCard key={i} label="" value="" icon={BarChart3} color="slate" loading />
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
        <StatCard
          label="Total Jobs Posted"
          value={safeStats.total_jobs_posted}
          icon={Briefcase}
          color="slate"
        />
        <StatCard
          label="Open Jobs"
          value={safeStats.open_jobs}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          label="Total Applications"
          value={safeStats.total_applications_received}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Apps This Week"
          value={safeStats.applications_this_week}
          icon={TrendingUp}
          color="violet"
        />
        <MostAppliedJobCard stats={safeStats} />
      </div>
      {isEmpty && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <Briefcase className="mx-auto h-9 w-9 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-600">
            Post your first job to see analytics
          </p>
          <Link
            href="/jobs/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <PlusCircle className="h-4 w-4" /> Post a Job
          </Link>
        </div>
      )}
    </div>
  );
}

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
        <WelcomeBanner user={user} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Applied"
            value={loading ? "—" : applications.length}
            icon={Briefcase}
            color="slate"
            loading={loading}
          />
          <StatCard
            label="Pending Review"
            value={loading ? "—" : pending}
            icon={Clock}
            color="amber"
            loading={loading}
          />
          <StatCard
            label="Accepted"
            value={loading ? "—" : accepted}
            icon={CheckCircle2}
            color="emerald"
            loading={loading}
          />
          <StatCard
            label="Rejected"
            value={loading ? "—" : rejected}
            icon={XCircle}
            color="red"
            loading={loading}
          />
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
        <WelcomeBanner user={user} />
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
      <WelcomeBanner user={user} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Platform Jobs"
          value={loading ? "—" : jobs.length}
          icon={Briefcase}
          color="slate"
          loading={loading}
        />
        <StatCard
          label="Open Jobs"
          value={loading ? "—" : open}
          icon={CheckCircle2}
          color="emerald"
          loading={loading}
        />
        <StatCard label="Access Level" value="Admin" icon={Shield} color="violet" />
      </div>
      <QuickActions role="admin" />
    </div>
  );
}
