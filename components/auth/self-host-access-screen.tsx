"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { CreedWordmark } from "@/components/creed/brand";

export function SelfHostAccessScreen({
  email,
  ownerEmail,
}: {
  email?: string | null;
  ownerEmail?: string | null;
}) {
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } finally {
      window.location.assign("/login");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--creed-background)] px-6 text-[var(--creed-text-primary)]">
      <div className="w-full max-w-sm">
        <CreedWordmark className="mx-auto mb-10 h-[20px]" />
        <div className="rounded-[var(--radius-xl)] border border-[var(--creed-border)] bg-[var(--creed-surface)] p-6 text-center">
          <h1 className="text-[20px] font-medium">
            Private Creed
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-[var(--creed-text-secondary)]">
            This self-hosted instance is limited to the owner account.
          </p>
          {email ? (
            <p className="mt-4 rounded-lg bg-[var(--creed-surface-raised)] px-3 py-2 text-[13px] text-[var(--creed-text-tertiary)]">
              Signed in as {email}
            </p>
          ) : null}
          {ownerEmail ? (
            <p className="mt-3 text-[13px] text-[var(--creed-text-tertiary)]">
              Owner: {ownerEmail}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void signOut()}
            disabled={signingOut}
            className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--creed-text-primary)] px-4 text-[14px] font-medium text-[var(--creed-button-primary-fg)] transition-colors hover:bg-[var(--creed-button-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? (
              <>
                Signing out
                <LoaderCircle className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "Sign out"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
