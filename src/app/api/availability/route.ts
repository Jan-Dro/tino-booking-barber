import { NextResponse } from "next/server";
import { availabilityQuerySchema } from "@/lib/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getAvailableTimeSlots } from "@/lib/booking";
import { GoogleCalendarError } from "@/lib/google-calendar";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = availabilityQuerySchema.safeParse({
    serviceId: searchParams.get("serviceId"),
    date: searchParams.get("date"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: service, error } = await supabase
    .from("services")
    .select("id, duration_minutes, active")
    .eq("id", parsed.data.serviceId)
    .single();

  if (error || !service || !service.active) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  try {
    const slots = await getAvailableTimeSlots(parsed.data.date, service.duration_minutes);
    return NextResponse.json({ slots });
  } catch (error) {
    if (error instanceof GoogleCalendarError) {
      return NextResponse.json({ error: error.message, slots: [] }, { status: error.status ?? 500 });
    }

    return NextResponse.json({ error: "Failed to load availability", slots: [] }, { status: 500 });
  }
}
