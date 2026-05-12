import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { GuestRoute } from "@/components/auth/guest-route";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <GuestRoute>
      <AuthShell
        eyebrow="Secure sign in"
        title="Return to your hiring and job search command center."
        description="Your access token is restored from local storage, while the refresh cookie is sent automatically by the browser when the API needs a new session."
      >
        <Suspense>
          <LoginForm />
        </Suspense>
      </AuthShell>
    </GuestRoute>
  );
}
