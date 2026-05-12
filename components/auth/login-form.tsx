"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormError } from "@/components/forms/form-error";
import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { authApi } from "@/lib/api";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as
      | { message?: unknown; error?: unknown }
      | undefined;
    const message = responseData?.message ?? responseData?.error;
    if (typeof message === "string") return message;
  }
  return "Invalid email or password. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleSubmit(values: LoginFormValues) {
    setError("");
    try {
      const authData = await authApi.login(values);
      const nextUrl = searchParams.get("next");
      router.replace(
        nextUrl || (authData.user.role === "admin" ? "/admin/users" : "/dashboard"),
      );
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
      <p className="mt-2 text-sm text-slate-500">
        Sign in to your account to continue
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-8 space-y-5"
        >
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
            autoComplete="current-password"
            placeholder="Enter your password"
          />

          <FormError message={error} />

          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
          >
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
          Create one free
        </Link>
      </p>
    </div>
  );
}
