"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs/legacy";
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

export function SignupForm() {
  const t = useTranslations("auth");
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [clubName, setClubName] = useState("");

  async function onCreate(formData: FormData) {
    if (!isLoaded) return;
    setError(null);
    setPending(true);
    const emailValue = String(formData.get("email") ?? "");
    try {
      await signUp.create({
        emailAddress: emailValue,
        password: String(formData.get("password") ?? ""),
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setEmail(emailValue);
      setFullName(String(formData.get("fullName") ?? ""));
      setClubName(String(formData.get("clubName") ?? ""));
      setStep("verify");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPending(false);
    }
  }

  async function onVerify() {
    if (!isLoaded) return;
    setError(null);
    setPending(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const params = new URLSearchParams({ clubName, fullName });
        router.push(`/onboarding?${params.toString()}`);
      } else {
        setError(result.status);
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPending(false);
    }
  }

  async function onResend() {
    if (!isLoaded) return;
    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
  }

  if (step === "verify") {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="font-display text-headline-md uppercase text-chalk">
            {t("verifyTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("verifySubtitle", { email })}
          </p>
        </div>

        <CodeInput value={code} onChange={setCode} />

        {error && (
          <p className="border border-touchline-red bg-touchline-red/10 px-3 py-2 text-sm text-touchline-red">
            {error}
          </p>
        )}

        <AuthSubmitButton
          type="button"
          pending={pending}
          disabled={code.length < 6}
          onClick={onVerify}
          label={t("verifyCta")}
        />

        <button
          type="button"
          onClick={onResend}
          className="text-sm text-muted-foreground hover:text-chalk"
        >
          {t("verifyResend")}
        </button>
      </div>
    );
  }

  return (
    <form action={onCreate} className="flex flex-col gap-5">
      <div className="flex border-b border-hairline-08">
        <span className="border-b-2 border-chalk px-3 py-2 text-label-tactical text-chalk">
          {t("signupTab")}
        </span>
        <Link
          href="/login"
          className="px-3 py-2 text-label-tactical text-muted-foreground hover:text-chalk"
        >
          {t("loginTab")}
        </Link>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">{t("fullName")}</Label>
        <Input id="fullName" name="fullName" required autoComplete="name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clubName">{t("clubName")}</Label>
        <Input id="clubName" name="clubName" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("password")}</Label>
        <PasswordInput id="password" name="password" autoComplete="new-password" required />
      </div>

      {error && (
        <p className="border border-touchline-red bg-touchline-red/10 px-3 py-2 text-sm text-touchline-red">
          {error}
        </p>
      )}

      <AuthSubmitButton pending={pending} label={t("setupDressingRoom")} />

      <p className="text-center text-xs text-muted-foreground">{t("hasInvite")}</p>
    </form>
  );
}
