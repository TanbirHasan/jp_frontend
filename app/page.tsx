import Link from "next/link";
import { JobCard } from "@/components/jobs/job-card";
import { getOpenJobs } from "@/lib/public-data";

export default async function Home() {
  const featuredJobs = (await getOpenJobs({ limit: "4" })).slice(0, 4);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-150 w-225 -translate-x-1/2 rounded-full bg-emerald-500 opacity-[0.06] blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-500 opacity-[0.04] blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32 lg:px-10 lg:py-36">
          {/* Live badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Now hiring · Thousands of open roles
          </div>

          <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Find Your Next Role.{" "}
            <span className="bg-linear-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Land It With Confidence.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Connect with top employers, apply in seconds, and track every application — all
            in one focused workspace built for modern job seekers.
          </p>

          {/* Search bar */}
          <form
            action="/jobs"
            className="mt-10 flex max-w-2xl overflow-hidden rounded-xl shadow-2xl shadow-black/30 sm:flex-row"
          >
            <input
              name="search"
              placeholder="Job title, skill, or keyword…"
              className="h-14 flex-1 border-0 bg-white px-5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="h-14 shrink-0 bg-emerald-600 px-7 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Search Jobs
            </button>
          </form>

          {/* Stats row */}
          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
            {[
              ["12k+", "Open positions"],
              ["800+", "Companies hiring"],
              ["50k+", "Candidates placed"],
            ].map(([num, label]) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">{num}</span>
                <span className="text-sm text-slate-500">{label}</span>
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
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Featured Positions</h2>
            </div>
            <Link
              href="/jobs"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-600 transition-all hover:bg-emerald-50 hover:text-emerald-700"
            >
              View all
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="square"
              >
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
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-sm text-slate-400">
                No jobs yet — connect your backend to see live listings here.
              </p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/jobs"
              className="inline-flex h-11 items-center rounded-xl border border-slate-300 bg-white px-8 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-md"
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
            <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">
              Whether you&apos;re searching, hiring, or administrating — Hirelane has a dedicated
              workspace for you.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "👤",
                title: "Job Seekers",
                desc: "Browse thousands of open roles, apply with a single click, and track every application status in real time.",
                color: "from-blue-50 to-blue-100/60",
                border: "border-blue-100 hover:border-blue-200",
                badge: "bg-blue-100 text-blue-700",
                badgeText: "For candidates",
              },
              {
                icon: "🏢",
                title: "Employers",
                desc: "Post roles, manage applicants, and build your company profile to attract the right candidates faster.",
                color: "from-emerald-50 to-emerald-100/60",
                border: "border-emerald-100 hover:border-emerald-200",
                badge: "bg-emerald-100 text-emerald-700",
                badgeText: "For companies",
              },
              {
                icon: "⚙️",
                title: "Administrators",
                desc: "Oversee platform activity, manage users, and keep job listings clean and up to date.",
                color: "from-violet-50 to-violet-100/60",
                border: "border-violet-100 hover:border-violet-200",
                badge: "bg-violet-100 text-violet-700",
                badgeText: "For admins",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`group rounded-2xl border bg-linear-to-br ${item.color} ${item.border} p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{item.icon}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.badge}`}
                  >
                    {item.badgeText}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative overflow-hidden bg-emerald-600 py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-5 text-center sm:px-8 lg:px-10">
          <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-3 text-emerald-100">
            Join thousands of professionals already using Hirelane.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex h-11 items-center rounded-xl bg-white px-8 text-sm font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 hover:shadow-md"
            >
              Create free account
            </Link>
            <Link
              href="/jobs"
              className="flex h-11 items-center rounded-xl border border-white/30 px-8 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Browse jobs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
