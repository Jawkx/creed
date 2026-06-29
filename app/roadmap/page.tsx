import type { Metadata } from "next";
import { RoadmapPageView } from "@/components/marketing/roadmap-page-view";
import { fetchRoadmap } from "@/lib/marketing/fetch-roadmap";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "A live view of what we're building, straight from Creed's task board.",
  alternates: { canonical: "/roadmap" },
};

// ISR: re-fetch the live median board about once a minute, so moving a task
// between phases on the median board shows up here within ~60s with no
// redeploy. median has no webhooks, so poll-on-revalidate is the freshest we
// can be while still serving a cached, prerendered page. The median API key is
// read server-side in fetchRoadmap and never reaches the client; only the
// mapped, public-safe columns are passed down. The page reads no
// cookies/headers, so it stays off the user-state fan-out like the other
// marketing routes.
export const revalidate = 60;

export default async function RoadmapPage() {
  const columns = await fetchRoadmap();
  return <RoadmapPageView columns={columns} />;
}
