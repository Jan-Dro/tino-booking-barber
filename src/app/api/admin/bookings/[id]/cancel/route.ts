import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { cancelCalendarEvent } from "@/lib/google-calendar";
import { createGoogleCalendarAddLink, generateIcs } from "@/lib/ics";
import { sendCancellationEmails } from "@/lib/email";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminSession();
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*, service:services(*)")
    .eq("id", id)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.google_calendar_event_id) {
    await cancelCalendarEvent(booking.google_calendar_event_id).catch(() => null);
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const startsAt = new Date(booking.starts_at);
  const endsAt = new Date(booking.ends_at);
  const details = `Service: ${booking.service?.name ?? "Appointment"}`;

  return sendCancellationEmails({
    to: booking.customer_email,
    customerName: booking.customer_name,
    serviceName: booking.service?.name ?? "Appointment",
    startsAt,
    endsAt,
    notes: booking.notes,
    addToGoogleCalendarUrl: createGoogleCalendarAddLink({
      title: "Cancelled appointment",
      details,
      startsAt,
      endsAt,
    }),
    icsContent: generateIcs({
      uid: booking.id,
      title: "Cancelled appointment",
      description: details,
      startsAt,
      endsAt,
    }),
  }).then(
    () => NextResponse.json({ success: true }),
    (emailError) => {
      const message =
        emailError instanceof Error
          ? emailError.message
          : "Cancellation email delivery failed";

      return NextResponse.json(
        {
          success: true,
          warning: "Booking cancelled, but cancellation email failed.",
          emailErrors: [message],
        },
        { status: 200 },
      );
    },
  );
}
