import { NextResponse } from "next/server";
import { analyzeCreedQuality, readQualityBaseline } from "@/lib/ai/quality";
import type { CreedSection } from "@/lib/creed-data";
import { requireApiAuth } from "@/lib/api-auth";

// Quality analysis can take 30–90s depending on the model. Give the route
// enough budget to finish even if the client disconnects mid-flight, so the
// server-side persist always completes.
export const maxDuration = 300;

export async function POST(request: Request) {
  const auth = await requireApiAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as {
      sections?: CreedSection[];
      force?: boolean;
      readOnly?: boolean;
      targetSectionIds?: string[];
    };

    if (!Array.isArray(body.sections) || body.sections.length > 200) {
      return NextResponse.json({ error: "Missing or oversized sections." }, { status: 400 });
    }

    if (body.readOnly) {
      const result = await readQualityBaseline({
        client: auth.supabase,
        userId: auth.user.id,
        sections: body.sections,
      });

      return NextResponse.json(result);
    }

    const result = await analyzeCreedQuality({
      client: auth.supabase,
      userId: auth.user.id,
      sections: body.sections,
      force: body.force,
      targetSectionIds: Array.isArray(body.targetSectionIds)
        ? body.targetSectionIds.filter((id): id is string => typeof id === "string")
        : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not analyze Creed quality." },
      { status: 400 }
    );
  }
}
