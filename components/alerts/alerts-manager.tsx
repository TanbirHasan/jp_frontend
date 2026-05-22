"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    alertsApi.list().then(setAlerts).catch(() => setAlerts([])).finally(() => setIsLoading(false));
  }, []);

  const hasAnyFilter = useMemo(() => {
    return Boolean(keywords.trim() || jobType || location.trim());
  }, [keywords, jobType, location]);

  async function createAlert() {
    setMessage("");
    if (!hasAnyFilter) {
      setMessage("Please set at least one filter before saving.");
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
      setMessage("Alert saved.");
    } catch {
      setMessage("Unable to save alert. Please try again.");
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
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="border border-[#dfe5dc] bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">{title ?? "Create Alert"}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {description ?? "Get emailed when new jobs match your filters."}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            placeholder="Keywords (e.g. backend, react)"
            className="h-10 border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-400 focus:bg-white"
          />
          <select
            value={jobType}
            onChange={(event) => setJobType(event.target.value as JobType | "")}
            className="h-10 border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition-colors focus:border-emerald-400 focus:bg-white"
          >
            <option value="">Any Job Type</option>
            {jobTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Location (e.g. Dhaka, Remote)"
            className="h-10 border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-400 focus:bg-white"
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={createAlert}
            disabled={isSaving}
            className="h-10 bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Alert"}
          </button>
          {message ? <p className="text-sm text-slate-500">{message}</p> : null}
        </div>
      </div>

      <div className="border border-[#dfe5dc] bg-white p-5">
        <h3 className="text-base font-semibold text-slate-900">My Alerts</h3>
        {isLoading ? (
          <p className="mt-3 text-sm text-slate-500">Loading alerts...</p>
        ) : alerts.length ? (
          <div className="mt-3 space-y-3">
            {alerts.map((alert) => {
              const chips = [alert.keywords, formatJobType(alert.job_type), alert.location].filter(Boolean);
              return (
                <article
                  key={alert.id}
                  className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {chips.length ? (
                      chips.map((chip) => (
                        <span
                          key={`${alert.id}-${chip}`}
                          className="bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"
                        >
                          {chip}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">No filters</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteAlert(String(alert.id))}
                    disabled={deletingId === String(alert.id)}
                    className="h-8 border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === String(alert.id) ? "Deleting..." : "Delete"}
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">You have no saved alerts yet.</p>
        )}
      </div>
    </section>
  );
}
