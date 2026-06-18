import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function requireAdminSession() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    authorized: true as const,
    user: data.user,
  };
}
