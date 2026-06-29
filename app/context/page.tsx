import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSelfHostedMode } from "@/lib/deployment-mode";

const PATH = "/context";
const TITLE = "What is a context file?";
const DESCRIPTION =
  "A personal context file is one structured profile that every AI reads before it answers you. Learn what goes in it, how agents keep it current, and how it differs from a chatbot's memory.";

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

export default async function ContextFilePage() {
  if (isSelfHostedMode()) {
    redirect("/");
  }

  const { ContextFilePageView } = await import("@/components/marketing/context-file-page-view");
  const { JsonLd } = await import("@/components/marketing/json-ld");
  const { contextFileFaqItems } = await import("@/lib/marketing/faq");
  const {
    breadcrumbSchema,
    faqPageSchema,
    graph,
    webPageSchema,
  } = await import("@/lib/seo/structured-data");

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION }),
          breadcrumbSchema(PATH, [
            { name: "Creed", path: "/home" },
            { name: "Context file", path: PATH },
          ]),
          faqPageSchema(contextFileFaqItems)
        )}
      />
      <ContextFilePageView />
    </>
  );
}
