"use client";

import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { getApiBaseUrl } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";
import type {
  AlertPayload,
  ApiEnvelope,
  Application,
  ApplicationStatus,
  AuthResponse,
  Company,
  CompanyFollowerCount,
  CompanyPayload,
  JobAlert,
  Job,
  EmployerStats,
  JobPayload,
  LoginPayload,
  RefreshResponse,
  RegisterPayload,
  TrackerEntry,
  TrackerEntryPayload,
  TrackerFilters,
  TrackerStatus,
  User,
} from "@/lib/types";

const API_BASE_URL = getApiBaseUrl();

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

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

function getUserFromResponse(data: User | AuthResponse | { user?: User }) {
  if ("user" in data && data.user) {
    return data.user;
  }

  return data as User;
}

function unwrapList<T>(data: T[] | Record<string, T[]>): T[] {
  if (Array.isArray(data)) return data;

  const firstList = Object.values(data).find(Array.isArray);
  return firstList ?? [];
}

function unwrapAlertsList(
  data:
    | JobAlert[]
    | { alerts: JobAlert[] }
    | Record<string, JobAlert[]>,
) {
  if (Array.isArray(data)) return data;
  if ("alerts" in data && Array.isArray(data.alerts)) return data.alerts;
  return unwrapList<JobAlert>(data);
}

function getApplicationFromResponse(
  data: Application | { application: Application },
) {
  return "application" in data ? data.application : data;
}

function getTrackerEntryFromResponse(
  data: TrackerEntry | { entry: TrackerEntry },
) {
  return "entry" in data ? data.entry : data;
}

function getAccessTokenFromResponse(data: AuthResponse | RefreshResponse) {
  const token = data.accessToken ?? data.access_token;

  if (!token || token === "undefined" || token === "null") {
    throw new Error(
      "The API response did not include a valid access token. Expected accessToken or access_token.",
    );
  }

  return token;
}

function getCurrentAccessToken() {
  const storeToken = useAuthStore.getState().accessToken;

  if (storeToken && storeToken !== "undefined" && storeToken !== "null") {
    return storeToken;
  }

  if (typeof window === "undefined") return null;

  const storedToken = localStorage.getItem("access_token");

  if (!storedToken || storedToken === "undefined" || storedToken === "null") {
    localStorage.removeItem("access_token");
    return null;
  }

  useAuthStore.getState().setAccessToken(storedToken);
  return storedToken;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getCurrentAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  refreshPromise ??= axios
    .post<RefreshResponse | ApiEnvelope<RefreshResponse>>(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    )
    .then((response) => {
      const token = getAccessTokenFromResponse(unwrapApiData(response.data));
      useAuthStore.getState().setAccessToken(token);
      return token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const token = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    }
  },
);

export const authApi = {
  async refreshSession() {
    const accessToken = await refreshAccessToken();
    return accessToken;
  },

  async register(payload: RegisterPayload) {
    const { data } = await api.post<AuthResponse | ApiEnvelope<AuthResponse>>(
      "/auth/register",
      payload,
    );
    const authData = unwrapApiData(data);
    useAuthStore
      .getState()
      .setAuth(getAccessTokenFromResponse(authData), authData.user);
    return authData;
  },

  async login(payload: LoginPayload) {
    const { data } = await api.post<AuthResponse | ApiEnvelope<AuthResponse>>(
      "/auth/login",
      payload,
    );
    const authData = unwrapApiData(data);
    useAuthStore
      .getState()
      .setAuth(getAccessTokenFromResponse(authData), authData.user);
    return authData;
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      useAuthStore.getState().clearAuth();
    }
  },

  async me(config?: AxiosRequestConfig) {
    const { data } = await api.get<
      User | { user: User } | ApiEnvelope<User | { user: User }>
    >("/users/me", config);
    const user = getUserFromResponse(unwrapApiData(data));
    useAuthStore.getState().setUser(user);
    return user;
  },
};

export const usersApi = {
  async updateMe(payload: Partial<Pick<User, "name" | "email">>) {
    const { data } = await api.patch<User | { user: User } | ApiEnvelope<User | { user: User }>>(
      "/users/me",
      payload,
    );
    const user = getUserFromResponse(unwrapApiData(data));
    useAuthStore.getState().setUser(user);
    return user;
  },
};

export const jobsApi = {
  async list() {
    const { data } = await api.get<Job[] | Record<string, Job[]> | ApiEnvelope<Job[] | Record<string, Job[]>>>(
      "/jobs",
    );
    return unwrapList<Job>(unwrapApiData(data));
  },

  async create(payload: JobPayload) {
    const { data } = await api.post<Job | { job: Job } | ApiEnvelope<Job | { job: Job }>>(
      "/jobs",
      payload,
    );
    const job = unwrapApiData(data);
    return "job" in job ? job.job : job;
  },

  async update(id: string, payload: Partial<JobPayload>) {
    const { data } = await api.patch<Job | { job: Job } | ApiEnvelope<Job | { job: Job }>>(
      `/jobs/${id}`,
      payload,
    );
    const job = unwrapApiData(data);
    return "job" in job ? job.job : job;
  },

  async remove(id: string) {
    await api.delete(`/jobs/${id}`);
  },

  async applicants(id: string) {
    const { data } = await api.get<
      Application[] | Record<string, Application[]> | ApiEnvelope<Application[] | Record<string, Application[]>>
    >(`/jobs/${id}/applicants`);
    return unwrapList<Application>(unwrapApiData(data));
  },

  async apply(id: string, payload?: { resume_url?: string }) {
    const { data } = await api.post<
      Application | { application: Application } | ApiEnvelope<Application | { application: Application }>
    >(`/jobs/${id}/apply`, payload ?? {});
    const application = unwrapApiData(data);
    return getApplicationFromResponse(application);
  },

  async applyWithResume(id: string, resume: File) {
    const formData = new FormData();
    formData.append("resume", resume);

    const { data } = await api.post<
      Application | { application: Application } | ApiEnvelope<Application | { application: Application }>
    >(`/jobs/${id}/apply`, formData, {
      headers: {
        "Content-Type": undefined,
      },
    });
    const application = unwrapApiData(data);
    return getApplicationFromResponse(application);
  },
};

export const applicationsApi = {
  async mine() {
    const { data } = await api.get<
      Application[] | Record<string, Application[]> | ApiEnvelope<Application[] | Record<string, Application[]>>
    >("/applications/me");
    return unwrapList<Application>(unwrapApiData(data));
  },

  async updateStatus(id: string, status: ApplicationStatus) {
    const { data } = await api.patch<
      Application | { application: Application } | ApiEnvelope<Application | { application: Application }>
    >(`/applications/${id}/status`, { status });
    const application = unwrapApiData(data);
    return getApplicationFromResponse(application);
  },

  async downloadResume(id: string) {
    const { data } = await api.get<Blob>(`/applications/${id}/resume`, {
      responseType: "blob",
    });
    return data;
  },
};

export const companiesApi = {
  async create(payload: CompanyPayload) {
    const { data } = await api.post<
      Company | { company: Company } | ApiEnvelope<Company | { company: Company }>
    >("/companies", payload);
    const company = unwrapApiData(data);
    return "company" in company ? company.company : company;
  },

  async get(id: string) {
    const { data } = await api.get<
      Company | { company: Company } | ApiEnvelope<Company | { company: Company }>
    >(`/companies/${id}`);
    const company = unwrapApiData(data);
    return "company" in company ? company.company : company;
  },

  async update(id: string, payload: CompanyPayload) {
    const { data } = await api.patch<
      Company | { company: Company } | ApiEnvelope<Company | { company: Company }>
    >(`/companies/${id}`, payload);
    const company = unwrapApiData(data);
    return "company" in company ? company.company : company;
  },

  async following() {
    const { data } = await api.get<
      Company[] | { companies: Company[] } | ApiEnvelope<Company[] | { companies: Company[] }>
    >("/companies/following");
    const companies = unwrapApiData(data);
    if (Array.isArray(companies)) return companies;
    return companies.companies ?? [];
  },

  async follow(id: string) {
    await api.post(`/companies/${id}/follow`);
  },

  async unfollow(id: string) {
    await api.delete(`/companies/${id}/follow`);
  },

  async followerCount(id: string) {
    const { data } = await api.get<
      CompanyFollowerCount | { follower_count: number } | ApiEnvelope<CompanyFollowerCount | { follower_count: number }>
    >(`/companies/${id}/followers`);
    const countData = unwrapApiData(data);
    return "follower_count" in countData ? countData.follower_count : 0;
  },
};

export const alertsApi = {
  async list() {
    const { data } = await api.get<
      JobAlert[]
      | { alerts: JobAlert[] }
      | Record<string, JobAlert[]>
      | ApiEnvelope<JobAlert[] | { alerts: JobAlert[] } | Record<string, JobAlert[]>>
    >("/alerts");
    return unwrapAlertsList(unwrapApiData(data));
  },

  async create(payload: AlertPayload) {
    const { data } = await api.post<
      JobAlert | { alert: JobAlert } | ApiEnvelope<JobAlert | { alert: JobAlert }>
    >("/alerts", payload);
    const alert = unwrapApiData(data);
    return "alert" in alert ? alert.alert : alert;
  },

  async remove(id: string) {
    await api.delete(`/alerts/${id}`);
  },
};

export const trackerApi = {
  async list(filters?: TrackerFilters) {
    const { data } = await api.get<
      | TrackerEntry[]
      | { entries: TrackerEntry[] }
      | Record<string, TrackerEntry[]>
      | ApiEnvelope<TrackerEntry[] | { entries: TrackerEntry[] } | Record<string, TrackerEntry[]>>
    >("/tracker", { params: filters });
    const entries = unwrapApiData(data);
    if (Array.isArray(entries)) return entries;
    if ("entries" in entries && Array.isArray(entries.entries)) return entries.entries;
    return unwrapList<TrackerEntry>(entries);
  },

  async create(payload: TrackerEntryPayload) {
    const { data } = await api.post<
      TrackerEntry | { entry: TrackerEntry } | ApiEnvelope<TrackerEntry | { entry: TrackerEntry }>
    >("/tracker", payload);
    return getTrackerEntryFromResponse(unwrapApiData(data));
  },

  async get(id: string | number) {
    const { data } = await api.get<
      TrackerEntry | { entry: TrackerEntry } | ApiEnvelope<TrackerEntry | { entry: TrackerEntry }>
    >(`/tracker/${id}`);
    return getTrackerEntryFromResponse(unwrapApiData(data));
  },

  async update(id: string | number, payload: Partial<TrackerEntryPayload>) {
    const { data } = await api.patch<
      TrackerEntry | { entry: TrackerEntry } | ApiEnvelope<TrackerEntry | { entry: TrackerEntry }>
    >(`/tracker/${id}`, payload);
    return getTrackerEntryFromResponse(unwrapApiData(data));
  },

  async updateStatus(id: string | number, application_status: TrackerStatus) {
    const { data } = await api.patch<
      TrackerEntry | { entry: TrackerEntry } | ApiEnvelope<TrackerEntry | { entry: TrackerEntry }>
    >(`/tracker/${id}/status`, { application_status });
    return getTrackerEntryFromResponse(unwrapApiData(data));
  },

  async remove(id: string | number) {
    await api.delete(`/tracker/${id}`);
  },
};

export const adminApi = {
  async users() {
    const { data } = await api.get<User[] | Record<string, User[]> | ApiEnvelope<User[] | Record<string, User[]>>>(
      "/users",
    );
    return unwrapList<User>(unwrapApiData(data));
  },

  async deactivateUser(id: string) {
    await api.delete(`/users/${id}`);
  },

  async removeJob(id: string) {
    await api.delete(`/jobs/${id}`);
  },
};

export const employersApi = {
  async stats() {
    const { data } = await api.get<EmployerStats | ApiEnvelope<EmployerStats>>("/employers/stats");
    return unwrapApiData(data);
  },
};
