import { z } from "zod";

export const companySchema = z.object({
  name: z.string().trim().min(2, "Company name is required."),
  logo_url: z.string().trim().url("Enter a valid logo URL.").optional().or(z.literal("")),
  website: z.string().trim().url("Enter a valid website URL.").optional().or(z.literal("")),
  description: z.string().trim().min(10, "Add a short company description."),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
