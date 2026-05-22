"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { companiesApi } from "@/lib/api";
import type { Company } from "@/lib/types";

export function FollowingCompaniesList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  useEffect(() => {
    companiesApi
      .following()
      .then(setCompanies)
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  async function unfollow(companyId: string) {
    setUnfollowingId(companyId);
    try {
      await companiesApi.unfollow(companyId);
      setCompanies((current) => current.filter((company) => String(company.id) !== companyId));
    } finally {
      setUnfollowingId(null);
    }
  }

  if (loading) {
    return (
      <p className="border border-[#dfe5dc] bg-white p-6 text-sm text-slate-500">
        Loading followed companies...
      </p>
    );
  }

  if (!companies.length) {
    return (
      <p className="border border-[#dfe5dc] bg-white p-6 text-sm text-slate-500">
        You are not following any companies yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {companies.map((company) => (
        <article key={company.id} className="border border-[#dfe5dc] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-slate-900 text-sm font-bold text-white">
                {company.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{company.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {company.description || "No description available."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/jobs?company_id=${company.id}`}
                className="h-9 border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
              >
                View Jobs
              </Link>
              <button
                type="button"
                onClick={() => unfollow(String(company.id))}
                disabled={unfollowingId === String(company.id)}
                className="h-9 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {unfollowingId === String(company.id) ? "Unfollowing..." : "Unfollow"}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
