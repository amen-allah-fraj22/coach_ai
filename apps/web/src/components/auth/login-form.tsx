"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useTranslations } from "next-intl";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

import { useRouter, Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { CodeInput } from "@/components/auth/code-input";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

function errorMessage(e: unknown): string {
  if (isClerkAPIResponseError(e)) return e.errors[0]?.longMessage ?? e.message;
  return e instanceof Error ? e.message : String(e);
}

type Mode = "login" | "forgot-request" | "forgot-reset";

export function LoginForm() {
  const t = useTranslations("auth");
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");

  async function onLogin(formData: FormData) {
    if (!isLoaded) return;
    setError(null);
    setPending(true);
    try {
      const result = await signIn.create({
        identifier: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError(result.status);
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPending(false);
    }
  }

  async function onRequestReset(formData: FormData) {
    if (!isLoaded) return;
    setError(null);
    setPending(true);
    const email = String(formData.get("email") ?? "");
    try {
      await signIn.create({ identifier: email, strategy: "reset_password_email_code" });
      setResetEmail(email);
      setMode("forgot-reset");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPending(false);
    }
  }

  async function onSubmitReset(formData: FormData) {
    if (!isLoaded) return;
    setError(null);
    setPending(true);
    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
      });
      if (attempt.status === "needs_new_password") {
        const result = await signIn.resetPassword({
          password: String(formData.get("password") ?? ""),
        });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/dashboard");
          return;
        }
      }
      setError(attempt.status);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPending(false);
    }
  }

  if (mode === "forgot-request") {
    return (
      <form action={onRequestReset} className="flex flex-col gap-5">
        <div>
          <h1 className="font-display text-headline-md uppercase text-chalk">
            {t("forgotTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("forgotSubtitle")}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        {error && (
          <p className="border border-touchline-red bg-touchline-red/10 px-3 py-2 text-sm text-touchline-red">
            {error}
          </p>
        )}
        <AuthSubmitButton pending={pending} label={t("forgotSendCode")} />
        <button
          type="button"
          onClick={() => setMode("login")}
          className="text-sm text-muted-foreground hover:text-chalk"
        >
          ← {t("backToLogin")}
        </button>
      </form>
    );
  }

  if (mode === "forgot-reset") {
    return (
      <form action={onSubmitReset} className="flex flex-col gap-5">
        <div>
          <h1 className="font-display text-headline-md uppercase text-chalk">
            {t("forgotTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("forgotCodeSent")} ({resetEmail})
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>{t("forgotCode")}</Label>
          <CodeInput value={resetCode} onChange={setResetCode} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t("forgotNewPassword")}</Label>
          <PasswordInput id="password" name="password" autoComplete="new-password" required />
        </div>
        {error && (
          <p className="border border-touchline-red bg-touchline-red/10 px-3 py-2 text-sm text-touchline-red">
            {error}
          </p>
        )}
        <AuthSubmitButton pending={pending} label={t("forgotSubmit")} />
      </form>
    );
  }

  return (
    <form action={onLogin} className="flex flex-col gap-5">
      <h1 className="font-display text-headline-md uppercase text-chalk">
        {t("enterDressingRoom")}
      </h1>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t("password")}</Label>
          <button
            type="button"
            onClick={() => setMode("forgot-request")}
            className="text-xs text-muted-foreground hover:text-chalk"
          >
            {t("forgotPassword")}
          </button>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </div>

      {error && (
        <p className="border border-touchline-red bg-touchline-red/10 px-3 py-2 text-sm text-touchline-red">
          {error}
        </p>
      )}

      <AuthSubmitButton pending={pending} label={t("loginCta")} />

      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <Link href="/signup" className="hover:text-chalk">
          <span className="text-chalk underline underline-offset-4">{t("signupTab")}</span>
        </Link>
        <p className="text-xs">{t("hasInvite")}</p>
      </div>
    </form>
  );
}
