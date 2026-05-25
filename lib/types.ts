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

export type TrackerStatus =
  | "applied"
  | "assessment"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted"
  | "withdrawn";

export type TrackerSortField = "applied_date" | "deadline" | "created_at";
export type TrackerSortOrder = "asc" | "desc";

export type Company = {
  id: string | number;
  employer_id: string | number;
  name: string;
  logo_url?: string | null;
  website?: string | null;
  description?: string | null;
  created_at?: string;
  followed_at?: string;
};

export type CompanyFollowerCount = {
  follower_count: number;
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

export type JobAlert = {
  id: string | number;
  user_id?: string | number;
  keywords?: string | null;
  job_type?: JobType | null;
  location?: string | null;
  created_at?: string;
};

export type TrackerEntry = {
  id: string | number;
  user_id?: string | number;
  job_title: string;
  company_name: string;
  job_url?: string | null;
  platform?: string | null;
  location?: string | null;
  job_type?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  applied_date?: string | null;
  deadline?: string | null;
  application_status: TrackerStatus;
  task_link?: string | null;
  task_deadline?: string | null;
  interview_date?: string | null;
  interview_type?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type TrackerEntryPayload = {
  job_title: string;
  company_name: string;
  job_url?: string;
  platform?: string;
  location?: string;
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  applied_date?: string;
  deadline?: string;
  application_status?: TrackerStatus;
  task_link?: string;
  task_deadline?: string;
  interview_date?: string;
  interview_type?: string;
  notes?: string;
};

export type TrackerFilters = {
  status?: TrackerStatus;
  platform?: string;
  sort?: TrackerSortField;
  order?: TrackerSortOrder;
};

export type JobFilters = {
  company_id?: string;
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

export type AlertPayload = {
  keywords?: string;
  job_type?: JobType;
  location?: string;
};

export type EmployerStats = {
  total_jobs_posted: number;
  open_jobs: number;
  total_applications_received: number;
  applications_this_week: number;
  most_applied_job: {
    id: string | number;
    title: string;
    count: number;
  } | null;
};
