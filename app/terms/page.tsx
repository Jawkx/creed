import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSelfHostedMode } from "@/lib/deployment-mode";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "The rules that govern your use of Creed.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  if (isSelfHostedMode()) {
    redirect("/");
  }

  const { TermsPageView } = await import("@/components/marketing/terms-page-view");
  return <TermsPageView />;
}
