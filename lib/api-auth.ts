import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSelfHostedOwnerEmail, isSelfHostedOwner } from "@/lib/deployment-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthContext = {
  supabase: SupabaseClient;
  user: User;
};

export async function requireApiAuth(): Promise<AuthContext | NextResponse> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSelfHostedOwner(user)) {
    return NextResponse.json(
      {
        error: "Forbidden",
        message: getSelfHostedOwnerEmail()
          ? "This self-hosted instance is limited to the owner account."
          : "This self-hosted instance is not available to this account.",
      },
      { status: 403 }
    );
  }

  return { supabase, user };
}
