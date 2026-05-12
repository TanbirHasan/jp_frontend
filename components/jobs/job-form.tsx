"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { FormError } from "@/components/forms/form-error";
import { FormInput } from "@/components/forms/form-input";
import { FormSelectBox } from "@/components/forms/form-select-box";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { jobsApi } from "@/lib/api";
import type { Job } from "@/lib/types";
import { jobSchema, type JobFormValues } from "@/lib/validations/job";

type JobFormProps = {
  job?: Job;
};

export function JobForm({ job }: JobFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job?.title ?? "",
      description: job?.description ?? "",
      location: job?.location ?? "",
      salary_min: job?.salary_min ? String(job.salary_min) : "",
      salary_max: job?.salary_max ? String(job.salary_max) : "",
      job_type: job?.job_type ?? "full_time",
      status: job?.status ?? "open",
    },
  });

  async function handleSubmit(values: JobFormValues) {
    setError("");
    const payload = {
      ...values,
      salary_min: values.salary_min ? Number(values.salary_min) : undefined,
      salary_max: values.salary_max ? Number(values.salary_max) : undefined,
    };

    try {
      if (job) {
        await jobsApi.update(String(job.id), payload);
      } else {
        await jobsApi.create(payload);
      }

      router.replace("/my-jobs");
      router.refresh();
    } catch (caughtError) {
      if (caughtError instanceof AxiosError) {
        const message = (caughtError.response?.data as { message?: string })?.message;
        setError(message ?? "Unable to save this job.");
        return;
      }

      setError("Unable to save this job.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid max-w-3xl gap-5 border border-[#dfe5dc] bg-white p-6 shadow-[0_20px_60px_rgba(49,60,43,0.08)]"
      >
        <FormInput control={form.control} name="title" label="Job title" />
        <FormTextarea
          control={form.control}
          name="description"
          label="Description"
          rows={7}
        />
        <FormInput control={form.control} name="location" label="Location" />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput
            control={form.control}
            name="salary_min"
            label="Minimum salary"
            type="number"
          />
          <FormInput
            control={form.control}
            name="salary_max"
            label="Maximum salary"
            type="number"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormSelectBox
            control={form.control}
            name="job_type"
            label="Job type"
            options={[
              { label: "Full time", value: "full_time" },
              { label: "Part time", value: "part_time" },
              { label: "Contract", value: "contract" },
              { label: "Remote", value: "remote" },
            ]}
          />
          <FormSelectBox
            control={form.control}
            name="status"
            label="Status"
            options={[
              { label: "Open", value: "open" },
              { label: "Closed", value: "closed" },
            ]}
          />
        </div>
        <FormError message={error} />
        <Button className="w-fit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : job ? "Update job" : "Post job"}
        </Button>
      </form>
    </Form>
  );
}
