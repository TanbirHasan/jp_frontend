"use client";

import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { companiesApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

type CompanyFollowControlsProps = {
  companyId: string;
};

export function CompanyFollowControls({ companyId }: CompanyFollowControlsProps) {
  const { hasHydrated, user } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    companiesApi.followerCount(companyId).then(setFollowerCount).catch(() => setFollowerCount(0));
  }, [companyId]);

  useEffect(() => {
    if (!hasHydrated || !user || user.role !== "job_seeker") return;

    companiesApi
      .following()
      .then((companies) => {
        setIsFollowing(companies.some((company) => String(company.id) === companyId));
      })
      .catch(() => setIsFollowing(false));
  }, [companyId, hasHydrated, user]);

  async function refreshFollowerCount() {
    try {
      const count = await companiesApi.followerCount(companyId);
      setFollowerCount(count);
    } catch {
      // Keep prior count if refresh fails.
    }
  }

  async function toggleFollow() {
    if (!user || user.role !== "job_seeker") return;

    const previousValue = isFollowing;
    const nextValue = !previousValue;
    setIsFollowing(nextValue);
    setIsBusy(true);

    try {
      if (nextValue) {
        await companiesApi.follow(companyId);
      } else {
        await companiesApi.unfollow(companyId);
      }
      await refreshFollowerCount();
    } catch (error) {
      if (
        error instanceof AxiosError &&
        nextValue &&
        error.response?.status === 409
      ) {
        setIsFollowing(true);
        await refreshFollowerCount();
      } else {
        setIsFollowing(previousValue);
      }
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <p className="text-sm font-medium text-slate-500">
        {followerCount ?? "..."} followers
      </p>
      {hasHydrated && user?.role === "job_seeker" ? (
        <button
          type="button"
          onClick={toggleFollow}
          disabled={isBusy}
          className={
            isFollowing
              ? "h-9 bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              : "h-9 border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          }
        >
          {isBusy ? "Saving..." : isFollowing ? "Following" : "Follow"}
        </button>
      ) : null}
    </div>
  );
}
