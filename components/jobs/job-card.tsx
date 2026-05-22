import Link from "next/link";
import type { Job } from "@/lib/types";

function formatSalary(job: Job) {
  if (!job.salary_min && !job.salary_max) return null;
  if (job.salary_min && job.salary_max)
    return `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}`;
  if (job.salary_min) return `From $${job.salary_min.toLocaleString()}`;
  return `Up to $${job.salary_max?.toLocaleString()}`;
}

const typeStyles: Record<string, string> = {
  full_time: "bg-blue-50 text-blue-700 border border-blue-100",
  part_time: "bg-violet-50 text-violet-700 border border-violet-100",
  contract: "bg-amber-50 text-amber-700 border border-amber-100",
  remote: "bg-emerald-50 text-emerald-700 border border-emerald-100",
};

const companyColors = [
  "bg-slate-800",
  "bg-emerald-700",
  "bg-blue-700",
  "bg-violet-700",
  "bg-amber-700",
  "bg-rose-700",
];

function companyColor(name: string) {
  const code = name.charCodeAt(0) % companyColors.length;
  return companyColors[code];
}

export function JobCard({ job }: { job: Job }) {
  const company = job.company_name ?? job.company?.name ?? "Company";
  const salary = formatSalary(job);
  const badgeClass = typeStyles[job.job_type] ?? "bg-slate-100 text-slate-600 border border-slate-200";

  return (
    <article className="group bg-white border border-slate-200 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        {/* Company initial */}
        <div
          className={`shrink-0 flex h-11 w-11 items-center justify-center text-sm font-bold text-white ${companyColor(company)}`}
        >
          {company.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/jobs/${job.id}`}
              className="font-semibold text-slate-900 leading-snug hover:text-emerald-700 transition-colors line-clamp-1"
            >
              {job.title}
            </Link>
            <span className={`shrink-0 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}>
              {job.job_type.replace("_", " ")}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {company} · {job.location}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600 line-clamp-2">
        {job.description}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        {salary ? (
          <span className="text-sm font-semibold text-slate-800">{salary}</span>
        ) : (
          <span className="text-sm text-slate-400">Salary not listed</span>
        )}
        <div className="flex items-center gap-3">
          <Link
            href={`/alerts?keywords=${encodeURIComponent(job.title)}&job_type=${job.job_type}&location=${encodeURIComponent(job.location)}`}
            className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-700"
          >
            Get alerts like this
          </Link>
          <Link
            href={`/jobs/${job.id}`}
            className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View details
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
