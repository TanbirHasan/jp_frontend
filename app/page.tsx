import Link from "next/link";
import { JobCard } from "@/components/jobs/job-card";
import { getOpenJobs } from "@/lib/public-data";

export default async function Home() {
  const featuredJobs = (await getOpenJobs({ limit: "4" })).slice(0, 4);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500 opacity-[0.07] blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-32">
          {/* Live badge */}
          <div className="mb-8 inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Now hiring · Thousands of open roles
          </div>

          <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            Find Your Next Role.{" "}
            <span className="text-emerald-400">Land It With Confidence.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Connect with top employers, apply in seconds, and track every
            application — all in one focused workspace built for modern job seekers.
          </p>

          {/* Search */}
          <form
            action="/jobs"
            className="mt-10 flex max-w-2xl flex-col gap-0 shadow-2xl sm:flex-row"
          >
            <input
              name="search"
              placeholder="Job title, skill, or keyword…"
              className="h-13 flex-1 border-0 bg-white px-5 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            />
            <button
              type="submit"
              className="h-13 bg-emerald-600 px-7 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Search Jobs
            </button>
          </form>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
            {[
              ["12k+", "Open positions"],
              ["800+", "Companies hiring"],
              ["50k+", "Candidates placed"],
            ].map(([num, label]) => (
              <div key={label}>
                <span className="text-xl font-bold text-white">{num}</span>
                <span className="ml-2 text-sm text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ── */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                Latest opportunities
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Featured Positions
              </h2>
            </div>
            <Link
              href="/jobs"
              className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View all jobs
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {featuredJobs.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="mt-8 border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-sm text-slate-400">
                No jobs yet — connect your backend to see live listings here.
              </p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/jobs"
              className="inline-flex h-11 items-center border border-slate-300 bg-white px-8 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors"
            >
              Browse all open positions
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Hirelane ── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
              Built for everyone
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              One platform, three workflows
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "👤",
                title: "Job Seekers",
                desc: "Browse thousands of open roles, apply with a single click, and track every application status in real time.",
              },
              {
                icon: "🏢",
                title: "Employers",
                desc: "Post roles, manage applicants, and build your company profile to attract the right candidates faster.",
              },
              {
                icon: "⚙️",
                title: "Administrators",
                desc: "Oversee platform activity, manage users, and keep job listings clean and up to date.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-slate-200 bg-slate-50 p-6 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
              >
                <div className="text-2xl">{item.icon}</div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-emerald-600 py-14">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-3 text-emerald-100">
            Join thousands of professionals already using Hirelane.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="h-11 bg-white px-8 flex items-center text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              Create free account
            </Link>
            <Link
              href="/jobs"
              className="h-11 border border-white/40 px-8 flex items-center text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Browse jobs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
