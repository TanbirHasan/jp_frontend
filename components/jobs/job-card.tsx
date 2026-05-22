import Link from "next/link";
import { MapPin, DollarSign, ArrowRight, Bell } from "lucide-react";
import type { Job } from "@/lib/types";

function formatSalary(job: Job) {
  if (!job.salary_min && !job.salary_max) return null;
  if (job.salary_min && job.salary_max)
    return `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}`;
  if (job.salary_min) return `From $${job.salary_min.toLocaleString()}`;
  return `Up to $${job.salary_max?.toLocaleString()}`;
}

const typeStyles: Record<string, string> = {
  full_time: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  part_time: "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
  contract: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  remote: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
};

const companyGradients = [
  "from-slate-700 to-slate-900",
  "from-emerald-600 to-emerald-800",
  "from-blue-600 to-blue-800",
  "from-violet-600 to-violet-800",
  "from-amber-600 to-amber-800",
  "from-rose-600 to-rose-800",
];

function companyGradient(name: string) {
  return companyGradients[name.charCodeAt(0) % companyGradients.length];
}

export function JobCard({ job }: { job: Job }) {
  const company = job.company_name ?? job.company?.name ?? "Company";
  const salary = formatSalary(job);
  const badgeClass =
    typeStyles[job.job_type] ?? "bg-slate-100 text-slate-600 ring-1 ring-slate-200";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
      {/* Top shimmer on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-emerald-400 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start gap-4">
        {/* Company avatar */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${companyGradient(company)} text-sm font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105`}
        >
          {company.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/jobs/${job.id}`}
              className="line-clamp-1 font-semibold leading-snug text-slate-900 transition-colors hover:text-emerald-700"
            >
              {job.title}
            </Link>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
            >
              {job.job_type.replace("_", " ")}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <span className="font-medium text-slate-600">{company}</span>
            <span className="text-slate-300">·</span>
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>{job.location}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
        {job.description}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        {salary ? (
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            {salary}
          </div>
        ) : (
          <span className="text-sm text-slate-400">Salary not listed</span>
        )}
        <div className="flex items-center gap-2">
          <Link
            href={`/alerts?keywords=${encodeURIComponent(job.title)}&job_type=${job.job_type}&location=${encodeURIComponent(job.location)}`}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
          >
            <Bell className="h-3.5 w-3.5" />
            Alert
          </Link>
          <Link
            href={`/jobs/${job.id}`}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100 hover:shadow-sm"
          >
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
