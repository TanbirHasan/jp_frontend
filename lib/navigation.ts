import type { User } from "@/lib/types";

export type NavItem = { href: string; label: string };

export const publicNavItems: NavItem[] = [{ href: "/jobs", label: "Browse Jobs" }];

export const navByRole: Record<User["role"], NavItem[]> = {
  job_seeker: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/jobs", label: "Jobs" },
    { href: "/tracker", label: "Tracker" },
    { href: "/alerts", label: "Alerts" },
    { href: "/following-companies", label: "Following" },
    { href: "/applications", label: "Applications" },
    { href: "/profile", label: "Profile" },
  ],
  employer: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/my-jobs", label: "My Jobs" },
    { href: "/jobs/new", label: "Post Job" },
    { href: "/company", label: "Company" },
    { href: "/profile", label: "Profile" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/jobs", label: "Jobs" },
    { href: "/profile", label: "Profile" },
  ],
};
