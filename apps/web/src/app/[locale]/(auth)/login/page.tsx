import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  // LoginForm reads ?redirect_url via useSearchParams, which needs a
  // Suspense boundary for this statically prerendered page to build.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
