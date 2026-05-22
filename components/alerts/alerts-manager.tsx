"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, X, Search, MapPin, Briefcase } from "lucide-react";
import { alertsApi } from "@/lib/api";
import type { AlertPayload, JobAlert, JobType } from "@/lib/types";

type AlertsManagerProps = {
  prefill?: {
    keywords?: string;
    job_type?: JobType;
    location?: string;
  };
  title?: string;
  description?: string;
};

const jobTypeOptions: { label: string; value: JobType }[] = [
  { label: "Full Time", value: "full_time" },
  { label: "Part Time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Remote", value: "remote" },
];

function formatJobType(type?: string | null) {
  if (!type) return "";
  return type.replace("_", " ");
}

export function AlertsManager({ prefill, title, description }: AlertsManagerProps) {
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [keywords, setKeywords] = useState(prefill?.keywords ?? "");
  const [jobType, setJobType] = useState<JobType | "">(prefill?.job_type ?? "");
  const [location, setLocation] = useState(prefill?.location ?? "");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    alertsApi
      .list()
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setIsLoading(false));
  }, []);

  const hasAnyFilter = useMemo(
    () => Boolean(keywords.trim() || jobType || location.trim()),
    [keywords, jobType, location],
  );

  async function createAlert() {
    setMessage("");
    setIsError(false);
    if (!hasAnyFilter) {
      setMessage("Please set at least one filter before saving.");
      setIsError(true);
      return;
    }

    const payload: AlertPayload = {};
    if (keywords.trim()) payload.keywords = keywords.trim();
    if (jobType) payload.job_type = jobType;
    if (location.trim()) payload.location = location.trim();

    setIsSaving(true);
    try {
      const newAlert = await alertsApi.create(payload);
      setAlerts((current) => [newAlert, ...current]);
      setMessage("Alert saved successfully.");
      setIsError(false);
    } catch {
      setMessage("Unable to save alert. Please try again.");
      setIsError(true);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteAlert(id: string) {
    setMessage("");
    setDeletingId(id);
    try {
      await alertsApi.remove(id);
      setAlerts((current) => current.filter((alert) => String(alert.id) !== id));
    } catch {
      setMessage("Unable to delete alert. Please try again.");
      setIsError(true);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-4">
      {/* Create Alert Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <Bell className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{title ?? "Create Alert"}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {description ?? "Get emailed when new jobs match your filters."}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Keywords (e.g. backend, react)"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 transition-all hover:border-slate-300 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="relative">
            <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value as JobType | "")}
              className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Any Job Type</option>
              {jobTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. Dhaka, Remote)"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 transition-all hover:border-slate-300 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={createAlert}
            disabled={isSaving}
            className="h-10 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save Alert"}
          </button>
          {message ? (
            <p className={`text-sm font-medium ${isError ? "text-red-500" : "text-emerald-600"}`}>
              {message}
            </p>
          ) : null}
        </div>
      </div>

      {/* My Alerts Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">My Alerts</h3>
        {isLoading ? (
          <div className="mt-4 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : alerts.length ? (
          <div className="mt-4 space-y-2.5">
            {alerts.map((alert) => {
              const chips = [
                alert.keywords,
                formatJobType(alert.job_type),
                alert.location,
              ].filter(Boolean);
              return (
                <article
                  key={alert.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:border-slate-200 hover:bg-white"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {chips.length ? (
                      chips.map((chip) => (
                        <span
                          key={`${alert.id}-${chip}`}
                          className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100"
                        >
                          {chip}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">No filters</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteAlert(String(alert.id))}
                    disabled={deletingId === String(alert.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Delete alert"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center py-6 text-center">
            <Bell className="h-8 w-8 text-slate-200" />
            <p className="mt-3 text-sm font-medium text-slate-500">No saved alerts yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Create an alert above to get notified of new matching jobs.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
