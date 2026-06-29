import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSelfHostedMode } from "@/lib/deployment-mode";

export const metadata: Metadata = {
  title: "Docs",
  description: "What Creed is, what belongs in your profile, how to connect agents over MCP, how they read and improve it, and the full tool and HTTP API reference.",
  alternates: { canonical: "/docs" },
};

export default async function DocsPage() {
  if (isSelfHostedMode()) {
    redirect("/");
  }

  const { DocsPageView } = await import("@/components/marketing/docs-page-view");
  return <DocsPageView />;
}
