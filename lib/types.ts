export type UserRole = "job_seeker" | "employer" | "admin";

export type User = {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  is_active?: boolean;
};

export type JobType = "full_time" | "part_time" | "contract" | "remote";
export type JobStatus = "open" | "closed";
export type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "accepted"
  | "rejected";

export type Company = {
  id: string | number;
  employer_id: string | number;
  name: string;
  logo_url?: string | null;
  website?: string | null;
  description?: string | null;
  created_at?: string;
};

export type Job = {
  id: string | number;
  company_id: string | number;
  title: string;
  description: string;
  location: string;
  salary_min?: number | null;
  salary_max?: number | null;
  job_type: JobType;
  status: JobStatus;
  created_at?: string;
  company?: Company;
  company_name?: string;
  website?: string | null;
  logo_url?: string | null;
  applications_count?: number;
};

export type Application = {
  id: string | number;
  job_id: string | number;
  applicant_id: string | number;
  resume_url?: string | null;
  status: ApplicationStatus;
  applied_at?: string;
  job?: Job;
  applicant?: User;
  applicant_name?: string;
  applicant_email?: string;
  job_title?: string;
  company_name?: string;
  location?: string;
  job_type?: JobType;
};

export type JobFilters = {
  type?: string;
  location?: string;
  salaryMin?: string;
  salaryMax?: string;
  search?: string;
  page?: string;
  limit?: string;
  sort?: string;
  order?: string;
};

export type AuthResponse = {
  user: User;
  accessToken?: string;
  access_token?: string;
};

export type RefreshResponse = {
  accessToken?: string;
  access_token?: string;
};

export type ApiEnvelope<T> = {
  data: T;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: Extract<UserRole, "job_seeker" | "employer">;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type JobPayload = {
  title: string;
  description: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  job_type: JobType;
  status?: JobStatus;
};

export type CompanyPayload = {
  name: string;
  logo_url?: string;
  website?: string;
  description?: string;
};
