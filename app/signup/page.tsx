import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SelfHostAccessScreen } from "@/components/auth/self-host-access-screen";
import {
  getSelfHostedOwnerEmail,
  isSelfHostedMode,
  isSelfHostedOwner,
} from "@/lib/deployment-mode";
import { sanitizeNextPath } from "@/lib/safe-next";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Create your account | Creed",
  description: "Create your Creed account.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const configured = isSupabaseConfigured();
  const nextPath = sanitizeNextPath((await searchParams).next);

  if (isSelfHostedMode()) {
    if (configured) {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && !isSelfHostedOwner(user)) {
        return (
          <SelfHostAccessScreen
            email={user.email}
            ownerEmail={getSelfHostedOwnerEmail()}
          />
        );
      }
      if (user) {
        redirect(nextPath);
      }
    }
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  // Already signed in? Send them on to `next` (or the app) rather than the form.
  if (configured) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      redirect(nextPath);
    }
  }

  const { AuthScreen } = await import("@/components/auth/auth-screen");
  return <AuthScreen mode="signup" configured={configured} nextPath={nextPath} />;
}
