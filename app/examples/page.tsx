import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSelfHostedMode } from "@/lib/deployment-mode";

const PATH = "/examples";
const TITLE = "Examples";
const DESCRIPTION =
  "Real moments where one shared file changes the answer: allergies and boundaries that hold in every tool, a writing voice that survives a switch, stack conventions that follow you into a fresh repo, and context that is yours to keep.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    url: PATH,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function ExamplesPage() {
  if (isSelfHostedMode()) {
    redirect("/");
  }

  const { ExamplesPageView } = await import("@/components/marketing/examples-page-view");
  const { JsonLd } = await import("@/components/marketing/json-ld");
  const { breadcrumbSchema, graph, webPageSchema } = await import("@/lib/seo/structured-data");

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION }),
          breadcrumbSchema(PATH, [
            { name: "Creed", path: "/home" },
            { name: "Examples", path: PATH },
          ])
        )}
      />
      <ExamplesPageView />
    </>
  );
}
