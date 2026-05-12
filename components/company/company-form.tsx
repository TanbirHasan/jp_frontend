"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/forms/form-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { companiesApi } from "@/lib/api";
import type { Company } from "@/lib/types";
import {
  companySchema,
  type CompanyFormValues,
} from "@/lib/validations/company";

export function CompanyForm({ company }: { company?: Company }) {
  const router = useRouter();
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name ?? "",
      logo_url: company?.logo_url ?? "",
      website: company?.website ?? "",
      description: company?.description ?? "",
    },
  });

  async function handleSubmit(values: CompanyFormValues) {
    const payload = {
      ...values,
      logo_url: values.logo_url || undefined,
      website: values.website || undefined,
    };

    if (company) {
      await companiesApi.update(String(company.id), payload);
    } else {
      await companiesApi.create(payload);
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid max-w-3xl gap-5 border border-[#dfe5dc] bg-white p-6 shadow-[0_20px_60px_rgba(49,60,43,0.08)]"
      >
        <FormInput control={form.control} name="name" label="Company name" />
        <FormInput control={form.control} name="website" label="Website" />
        <FormInput control={form.control} name="logo_url" label="Logo URL" />
        <FormTextarea
          control={form.control}
          name="description"
          label="Description"
          rows={6}
        />
        <Button className="w-fit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save company"}
        </Button>
      </form>
    </Form>
  );
}
