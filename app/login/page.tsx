import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SelfHostAccessScreen } from "@/components/auth/self-host-access-screen";
import { SelfHostLoginScreen } from "@/components/auth/self-host-login-screen";
import {
  getSelfHostedOwnerEmail,
  isSelfHostedMode,
  isSelfHostedOwner,
} from "@/lib/deployment-mode";
import { sanitizeNextPath } from "@/lib/safe-next";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in | Creed",
  description: "Sign in to your Creed.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const configured = isSupabaseConfigured();
  const nextPath = sanitizeNextPath((await searchParams).next);

  // Already signed in? Don't show the login form (which would let them loop
  // through OAuth pointlessly) - send them on to `next` (or the app).
  if (configured) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      if (!isSelfHostedOwner(user)) {
        return (
          <SelfHostAccessScreen
            email={user.email}
            ownerEmail={getSelfHostedOwnerEmail()}
          />
        );
      }
      redirect(nextPath);
    }
  }

  if (isSelfHostedMode()) {
    return (
      <SelfHostLoginScreen
        configured={configured}
        nextPath={nextPath}
        ownerEmail={getSelfHostedOwnerEmail()}
      />
    );
  }

  const { AuthScreen } = await import("@/components/auth/auth-screen");
  return <AuthScreen mode="login" configured={configured} nextPath={nextPath} />;
}
