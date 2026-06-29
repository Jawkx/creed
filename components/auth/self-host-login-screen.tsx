"use client";

import { useRef, useState, type FormEvent } from "react";
import { LoaderCircle, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { CreedWordmark } from "@/components/creed/brand";
import { AuthField, AuthSubmitButton, PasswordField } from "@/components/auth/auth-fields";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function authErrorMessage(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "That email or password is incorrect.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirm your email first, then sign in.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  return message || "Something went wrong. Try again.";
}

export function SelfHostLoginScreen({
  configured,
  nextPath,
  ownerEmail,
}: {
  configured: boolean;
  nextPath: string;
  ownerEmail?: string | null;
}) {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(ownerEmail ?? "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState<string | null>(null);

  function validate() {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) {
      next.email = "Enter your email.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!password) {
      next.password = "Enter your password.";
    }
    return next;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || !configured) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (nextErrors.password) {
      passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        toast.error(authErrorMessage(error.message));
        return;
      }
      window.location.assign(nextPath);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    if (submitting || !configured) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !EMAIL_PATTERN.test(trimmedEmail)) {
      setErrors((current) => ({
        ...current,
        email: "Enter your email to reset your password.",
      }));
      emailRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) {
        toast.error(error.message || "Couldn't send the reset link. Try again.");
        return;
      }
      setResetSent(trimmedEmail);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--creed-background)] px-6 text-[var(--creed-text-primary)]">
      <div className="w-full max-w-sm">
        <CreedWordmark className="mx-auto mb-10 h-[20px]" />
        <div className="rounded-[var(--radius-xl)] border border-[var(--creed-border)] bg-[var(--creed-surface)] p-6">
          {resetSent ? (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF5] text-[#16A34A] dark:bg-[#052e1a]/60 dark:text-[#4ade80]">
                <MailCheck className="h-6 w-6" />
              </div>
              <h1 className="mt-5 text-[22px] font-medium">
                Check your inbox
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-[var(--creed-text-secondary)]">
                We sent a password reset link to{" "}
                <span className="font-medium text-[var(--creed-text-primary)]">
                  {resetSent}
                </span>
                .
              </p>
              <button
                type="button"
                onClick={() => setResetSent(null)}
                className="mt-6 text-[14px] font-medium text-[var(--creed-text-primary)] transition-colors hover:text-[#2563EB]"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-center text-[24px] font-medium">
                Sign in
              </h1>
              <p className="mt-2 text-center text-[14px] leading-6 text-[var(--creed-text-secondary)]">
                Private self-hosted instance.
              </p>

              {!configured ? (
                <p className="mt-5 rounded-lg border border-[#F59E0B]/30 bg-[#FFFBEB] px-3 py-2 text-[13px] leading-5 text-[#92400E] dark:bg-[#3a2605] dark:text-[#FBBF24]">
                  Supabase is not configured on this deployment.
                </p>
              ) : null}

              <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-3">
                <AuthField
                  ref={emailRef}
                  type="email"
                  label="Email"
                  autoComplete="email"
                  value={email}
                  disabled={submitting || Boolean(ownerEmail)}
                  error={errors.email}
                  onChange={(value) => {
                    setEmail(value);
                    if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
                  }}
                />
                <PasswordField
                  inputRef={passwordRef}
                  label="Password"
                  autoComplete="current-password"
                  value={password}
                  disabled={submitting}
                  error={errors.password}
                  onChange={(value) => {
                    setPassword(value);
                    if (errors.password) {
                      setErrors((current) => ({ ...current, password: undefined }));
                    }
                  }}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => void handleForgotPassword()}
                    disabled={submitting || !configured}
                    className="text-[14px] text-[var(--creed-text-secondary)] transition-colors hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Forgot password?
                  </button>
                </div>
                <AuthSubmitButton
                  label="Sign in"
                  loading={submitting}
                  disabled={submitting || !configured}
                />
              </form>

              {submitting ? (
                <div className="mt-4 flex justify-center text-[var(--creed-text-tertiary)]">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
