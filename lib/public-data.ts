import { cacheTag } from "next/cache";
import type { ApiEnvelope, Company, Job, JobFilters } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

function unwrapApiData<T>(responseData: T | ApiEnvelope<T>) {
  if (
    responseData &&
    typeof responseData === "object" &&
    "data" in responseData
  ) {
    return responseData.data;
  }

  return responseData;
}

function toQueryString(filters?: JobFilters) {
  const params = new URLSearchParams();

  if (!filters) return "";

  if (filters.search) params.set("search", filters.search);
  if (filters.company_id) params.set("company_id", filters.company_id);
  if (filters.type) params.set("job_type", filters.type);
  if (filters.location) params.set("location", filters.location);
  if (filters.salaryMin) params.set("salary_min", filters.salaryMin);
  if (filters.salaryMax) params.set("salary_max", filters.salaryMax);
  if (filters.page) params.set("page", filters.page);
  if (filters.limit) params.set("limit", filters.limit);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getOpenJobs(filters?: JobFilters) {
  "use cache";
  cacheTag("jobs");

  try {
    const response = await fetch(
      `${API_BASE_URL}/jobs${toQueryString(filters)}`,
      {
        next: { tags: ["jobs"] },
      },
    );

    if (!response.ok) return [];

    const json = await response.json();
    const data = unwrapApiData<Job[] | { jobs: Job[] }>(json);

    if (Array.isArray(data)) return data;
    return data.jobs ?? [];
  } catch {
    return [];
  }
}

export async function getJobById(id: string) {
  "use cache";
  cacheTag("jobs", `job-${id}`);

  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      next: { tags: ["jobs", `job-${id}`] },
    });

    if (!response.ok) return null;

    const json = await response.json();
    const data = unwrapApiData<Job | { job: Job }>(json);

    if ("job" in data) return data.job;
    return data;
  } catch {
    return null;
  }
}

export async function getCompanyById(id: string) {
  "use cache";
  cacheTag("companies", `company-${id}`);

  try {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      next: { tags: ["companies", `company-${id}`] },
    });

    if (!response.ok) return null;

    const json = await response.json();
    const data = unwrapApiData<Company | { company: Company }>(json);

    if ("company" in data) return data.company;
    return data;
  } catch {
    return null;
  }
}

export async function getCompanyJobs(companyId: string) {
  "use cache";
  cacheTag("jobs", `company-${companyId}-jobs`);

  const jobs = await getOpenJobs();
  return jobs.filter((job) => String(job.company_id) === companyId);
}
