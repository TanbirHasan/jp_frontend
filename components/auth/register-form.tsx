"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormError } from "@/components/forms/form-error";
import { FormInput } from "@/components/forms/form-input";
import { FormSelectBox } from "@/components/forms/form-select-box";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { authApi } from "@/lib/api";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as
      | { message?: unknown; error?: unknown }
      | undefined;
    const message = responseData?.message ?? responseData?.error;
    if (typeof message === "string") return message;
  }
  return "Unable to create your account. Please try again.";
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "job_seeker" },
  });

  async function handleSubmit(values: RegisterFormValues) {
    setError("");
    try {
      const authData = await authApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role === "job_seeker" ? undefined : values.role,
      });
      router.replace(authData.user.role === "admin" ? "/admin/users" : "/dashboard");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
      <p className="mt-2 text-sm text-slate-500">
        Join as a job seeker or open an employer workspace
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-8 space-y-5"
        >
          <FormInput
            control={form.control}
            name="name"
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Alex Johnson"
          />
          <FormInput
            control={form.control}
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <FormInput
            control={form.control}
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
          <FormSelectBox
            control={form.control}
            name="role"
            label="Account type"
            options={[
              { label: "Job seeker — browse & apply", value: "job_seeker" },
              { label: "Employer — post & hire", value: "employer" },
            ]}
          />

          <FormError message={error} />

          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
          >
            {form.formState.isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
