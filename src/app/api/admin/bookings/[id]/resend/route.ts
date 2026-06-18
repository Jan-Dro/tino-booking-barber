import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createGoogleCalendarAddLink, generateIcs } from "@/lib/ics";
import { sendCustomerConfirmationEmail } from "@/lib/email";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminSession();
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, service:services(*)")
    .eq("id", id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const startsAt = new Date(booking.starts_at);
  const endsAt = new Date(booking.ends_at);
  const serviceName = booking.service?.name ?? "Appointment";
  const details = `Service: ${serviceName}\nCustomer: ${booking.customer_name}`;

  return sendCustomerConfirmationEmail({
    to: booking.customer_email,
    customerName: booking.customer_name,
    serviceName,
    startsAt,
    endsAt,
    notes: booking.notes,
    addToGoogleCalendarUrl: createGoogleCalendarAddLink({
      title: `Barber Appointment - ${serviceName}`,
      details,
      startsAt,
      endsAt,
      location: "Tino Barber Studio",
    }),
    icsContent: generateIcs({
      uid: booking.id,
      title: `Barber Appointment - ${serviceName}`,
      description: details,
      location: "Tino Barber Studio",
      startsAt,
      endsAt,
    }),
  }).then(
    () => NextResponse.json({ success: true }),
    (emailError) => {
      const message =
        emailError instanceof Error ? emailError.message : "Confirmation email delivery failed";

      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status: 200 },
      );
    },
  );
}
