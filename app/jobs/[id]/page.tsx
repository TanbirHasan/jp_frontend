import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyButton } from "@/components/jobs/apply-button";
import { getJobById } from "@/lib/public-data";

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

const typeStyles: Record<string, string> = {
  full_time: "bg-blue-50 text-blue-700 border border-blue-100",
  part_time: "bg-violet-50 text-violet-700 border border-violet-100",
  contract: "bg-amber-50 text-amber-700 border border-amber-100",
  remote: "bg-emerald-50 text-emerald-700 border border-emerald-100",
};

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Not specified";
  if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  if (min) return `From $${min.toLocaleString()}`;
  return `Up to $${max?.toLocaleString()}`;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();

  const company = job.company_name ?? job.company?.name ?? "Company";
  const badgeClass = typeStyles[job.job_type] ?? "bg-slate-100 text-slate-600 border border-slate-200";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:px-10">

        {/* Back */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to jobs
        </Link>

        <div className="mt-6 lg:flex lg:items-start lg:gap-6">
          {/* Main content */}
          <div className="flex-1 space-y-4">
            {/* Header card */}
            <div className="bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-slate-900 text-xl font-bold text-white">
                  {company.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {job.title}
                  </h1>
                  <p className="mt-1 text-slate-500">
                    {company} · {job.location}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}>
                      {job.job_type.replace("_", " ")}
                    </span>
                    <span className="border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key info row */}
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Salary</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Job type</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {job.job_type.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Location</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{job.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">About this role</h2>
              <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {job.description}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="mt-4 space-y-3 lg:mt-0 lg:w-60 lg:shrink-0">
            <div className="bg-white border border-slate-200 p-5 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-slate-900">Apply for this role</p>
              <ApplyButton jobId={String(job.id)} />
            </div>

            {job.company_id ? (
              <Link
                href={`/companies/${job.company_id}`}
                className="flex items-center justify-between border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                View company profile
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
