import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSelfHostedMode } from "@/lib/deployment-mode";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Creed collects, uses, and protects your information.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  if (isSelfHostedMode()) {
    redirect("/");
  }

  const { PrivacyPageView } = await import("@/components/marketing/privacy-page-view");
  return <PrivacyPageView />;
}
