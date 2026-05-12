import { notFound } from "next/navigation";
import { JobCard } from "@/components/jobs/job-card";
import { getCompanyById, getCompanyJobs } from "@/lib/public-data";

type CompanyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params;
  const [company, jobs] = await Promise.all([
    getCompanyById(id),
    getCompanyJobs(id),
  ]);

  if (!company) notFound();

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-slate-900 text-2xl font-bold text-white">
              {company.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                Company profile
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">
                {company.name}
              </h1>
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  {company.website}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
              ) : null}
            </div>
          </div>

          {company.description ? (
            <p className="mt-6 max-w-3xl text-base leading-7 text-slate-500">
              {company.description}
            </p>
          ) : (
            <p className="mt-6 text-sm text-slate-400 italic">
              This company has not added a description yet.
            </p>
          )}
        </div>
      </div>

      {/* Jobs */}
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Active positions
            <span className="ml-2 text-sm font-medium text-slate-400">
              ({jobs.length})
            </span>
          </h2>
        </div>

        {jobs.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="text-3xl">📋</div>
            <p className="mt-3 text-sm font-medium text-slate-500">
              No active positions right now.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Check back later for new openings from {company.name}.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
