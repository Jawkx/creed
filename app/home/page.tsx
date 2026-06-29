import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSelfHostedMode } from "@/lib/deployment-mode";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// /home is the canonical public landing (the root `/` redirects here for
// signed-out visitors). It inherits the brand title.default and the full
// openGraph card from the root layout; we only pin the canonical so search
// and AI engines treat /home, not the redirecting root, as the indexable
// page. (Don't set a partial openGraph here - Next replaces the object
// rather than deep-merging, which would drop the inherited share image.)
export const metadata: Metadata = {
  alternates: { canonical: "/home" },
};

export default async function HomeLandingPage() {
  if (isSelfHostedMode()) {
    redirect("/");
  }

  const { LandingHeroEntry } = await import("@/components/auth/landing-hero-entry");
  const { JsonLd } = await import("@/components/marketing/json-ld");
  const { homeFaqItems } = await import("@/lib/marketing/faq");
  const {
    faqPageSchema,
    graph,
    organizationSchema,
    softwareApplicationSchema,
    websiteSchema,
  } = await import("@/lib/seo/structured-data");

  return (
    <>
      <JsonLd
        data={graph(
          organizationSchema(),
          websiteSchema(),
          softwareApplicationSchema(),
          faqPageSchema(homeFaqItems)
        )}
      />
      <LandingHeroEntry configured={isSupabaseConfigured()} />
    </>
  );
}
