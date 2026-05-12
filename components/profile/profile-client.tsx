"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { FormError } from "@/components/forms/form-error";
import { FormInput } from "@/components/forms/form-input";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { usersApi } from "@/lib/api";
import type { User } from "@/lib/types";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";

export function ProfileClient() {
  return (
    <ProtectedRoute>
      {(user) => <ProfileContent user={user} />}
    </ProtectedRoute>
  );
}

function ProfileContent({ user }: { user: User }) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  async function handleSubmit(values: ProfileFormValues) {
    await usersApi.updateMe(values);
  }

  return (
    <AppShell
      user={user}
      title="Profile"
      description="Keep your personal account details up to date."
    >
      <div className="max-w-xl border border-[#dfe5dc] bg-white p-6 shadow-[0_20px_60px_rgba(49,60,43,0.08)]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormInput control={form.control} name="name" label="Name" />
            <FormInput
              control={form.control}
              name="email"
              label="Email"
              type="email"
            />
            <FormError message={form.formState.errors.root?.message} />
            <Button disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </Form>
      </div>
    </AppShell>
  );
}
