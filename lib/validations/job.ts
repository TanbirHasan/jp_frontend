import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().trim().min(3, "Job title is required."),
  description: z.string().trim().min(20, "Description must be at least 20 characters."),
  location: z.string().trim().min(2, "Location is required."),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  job_type: z.enum(["full_time", "part_time", "contract", "remote"]),
  status: z.enum(["open", "closed"]),
});

export type JobFormValues = z.infer<typeof jobSchema>;
