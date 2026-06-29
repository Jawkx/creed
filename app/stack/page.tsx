import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSelfHostedMode } from "@/lib/deployment-mode";

export const metadata: Metadata = {
  title: "Stack",
  description: "The technology Creed uses to run, store, and process your data.",
  alternates: { canonical: "/stack" },
};

export default async function StackPage() {
  if (isSelfHostedMode()) {
    redirect("/");
  }

  const { StackPageView } = await import("@/components/marketing/stack-page-view");
  return <StackPageView />;
}
