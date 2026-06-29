import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSelfHostedMode } from "@/lib/deployment-mode";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Creed pricing information and current access status.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  if (isSelfHostedMode()) {
    redirect("/");
  }

  const { PricingPageView } = await import("@/components/marketing/pricing-page-view");
  return <PricingPageView />;
}
