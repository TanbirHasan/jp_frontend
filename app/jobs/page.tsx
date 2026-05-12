import Link from "next/link";
import { JobCard } from "@/components/jobs/job-card";
import { getOpenJobs } from "@/lib/public-data";
import type { JobFilters } from "@/lib/types";

type JobsPageProps = {
  searchParams: Promise<JobFilters>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const filters = await searchParams;
  const jobs = await getOpenJobs(filters);
  const hasFilters = filters.search || filters.location || filters.type;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
            Open positions
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900 sm:text-5xl">
            Find Your Next Job
          </h1>
          <p className="mt-3 text-slate-500">
            {jobs.length > 0
              ? `${jobs.length} position${jobs.length !== 1 ? "s" : ""} available${hasFilters ? " matching your filters" : ""}`
              : "No positions found"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-10 border-b border-slate-200 bg-white shadow-sm">
        <form className="mx-auto w-full max-w-7xl px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              name="search"
              defaultValue={filters.search}
              placeholder="Search by title or keyword…"
              className="h-10 flex-1 border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:bg-white transition-colors"
            />
            <input
              name="location"
              defaultValue={filters.location}
              placeholder="Location"
              className="h-10 w-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:bg-white transition-colors sm:w-44"
            />
            <select
              name="type"
              defaultValue={filters.type}
              className="h-10 w-full border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:bg-white transition-colors sm:w-40"
            >
              <option value="">Any type</option>
              <option value="full_time">Full time</option>
              <option value="part_time">Part time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
            <button
              type="submit"
              className="h-10 bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shrink-0"
            >
              Filter
            </button>
            {hasFilters && (
              <Link
                href="/jobs"
                className="flex h-10 items-center border border-slate-200 px-4 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors shrink-0"
              >
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {jobs.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 bg-white py-20 text-center">
            <div className="text-4xl">🔍</div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">No jobs found</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Try adjusting your search terms or clearing the filters to see all
              available positions.
            </p>
            <Link
              href="/jobs"
              className="mt-6 inline-flex h-10 items-center bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Clear filters
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
