"use client";

import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/auth-store";
import type {
  ApiEnvelope,
  Application,
  ApplicationStatus,
  AuthResponse,
  Company,
  CompanyPayload,
  Job,
  JobPayload,
  LoginPayload,
  RefreshResponse,
  RegisterPayload,
  User,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

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
    return "application" in application ? application.application : application;
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
    return "application" in application ? application.application : application;
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
