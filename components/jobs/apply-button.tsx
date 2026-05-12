"use client";

import Link from "next/link";
import { useState } from "react";
import { AxiosError } from "axios";
import { jobsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export function ApplyButton({ jobId }: { jobId: string }) {
  const { hasHydrated, user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [applied, setApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function apply() {
    setMessage("");
    setIsSubmitting(true);
    try {
      await jobsApi.apply(jobId);
      setApplied(true);
      setMessage("Application submitted successfully!");
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
        className="flex h-11 w-full items-center justify-center bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
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
      <div className="flex h-11 w-full items-center justify-center bg-emerald-50 border border-emerald-200 px-6 text-sm font-semibold text-emerald-700">
        ✓ Application submitted
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={apply}
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting…" : "Apply now"}
      </button>
      {message && (
        <p className="text-sm text-slate-500 text-center">{message}</p>
      )}
    </div>
  );
}
