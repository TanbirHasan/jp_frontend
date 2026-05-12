import { AuthShell } from "@/components/auth/auth-shell";
import { GuestRoute } from "@/components/auth/guest-route";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <GuestRoute>
      <AuthShell
        eyebrow="Create access"
        title="Start as a candidate or open an employer workspace."
        description="Job seekers can browse and apply immediately. Employers can create company profiles and publish roles once the next API phase is connected."
      >
        <RegisterForm />
      </AuthShell>
    </GuestRoute>
  );
}
