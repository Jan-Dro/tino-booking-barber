import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") ?? "").trim();

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("bookings")
    .select("*, service:services(*)")
    .order("starts_at", { ascending: false });

  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}
