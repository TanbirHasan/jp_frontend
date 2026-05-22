"use client";

import { AxiosError } from "axios";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { jobsApi } from "@/lib/api";
import type { JobType } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";

type ApplyButtonProps = {
  jobId: string;
  alertPrefill?: {
    keywords?: string;
    job_type?: JobType;
    location?: string;
  };
};

function buildAlertLink(prefill?: ApplyButtonProps["alertPrefill"]) {
  const params = new URLSearchParams();
  if (prefill?.keywords) params.set("keywords", prefill.keywords);
  if (prefill?.job_type) params.set("job_type", prefill.job_type);
  if (prefill?.location) params.set("location", prefill.location);
  const query = params.toString();
  return query ? `/alerts?${query}` : "/alerts";
}

export function ApplyButton({ jobId, alertPrefill }: ApplyButtonProps) {
  const { hasHydrated, user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [applied, setApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setResumeFile(event.target.files?.[0] ?? null);
    setMessage("");
  }

  async function apply() {
    setMessage("");

    if (!resumeFile) {
      setMessage("Please upload your resume before applying.");
      return;
    }

    setIsSubmitting(true);

    try {
      await jobsApi.applyWithResume(jobId, resumeFile);
      setApplied(true);
      setMessage("Application submitted.");
    } catch (caughtError) {
      if (caughtError instanceof AxiosError) {
        setMessage(
          (caughtError.response?.data as { message?: string })?.message ??
            "Unable to apply. Please try again.",
        );
      } else {
        setMessage("Unable to apply. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!hasHydrated || !user) {
    return (
      <Link
        href={`/login?next=/jobs/${jobId}`}
        className="flex h-11 w-full items-center justify-center bg-emerald-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        Login to apply
      </Link>
    );
  }

  if (user.role !== "job_seeker") {
    return (
      <div className="flex h-11 w-full items-center justify-center border border-slate-200 px-6 text-sm font-medium text-slate-400">
        Only job seekers can apply
      </div>
    );
  }

  if (applied) {
    return (
      <div className="space-y-3">
        <div className="flex h-11 w-full items-center justify-center border border-emerald-200 bg-emerald-50 px-6 text-sm font-semibold text-emerald-700">
          Application submitted
        </div>
        <Link
          href={buildAlertLink(alertPrefill)}
          className="flex h-10 w-full items-center justify-center border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          Want alerts for similar jobs?
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        disabled={isSubmitting}
        className="block w-full text-sm text-slate-600 file:mr-4 file:h-11 file:border-0 file:bg-slate-100 file:px-4 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <button
        onClick={apply}
        disabled={isSubmitting || !resumeFile}
        className="flex h-11 w-full items-center justify-center bg-emerald-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Apply"}
      </button>
      {message && <p className="text-center text-sm text-slate-500">{message}</p>}
    </div>
  );
}
