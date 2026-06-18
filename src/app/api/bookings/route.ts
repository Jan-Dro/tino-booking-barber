import { addMinutes, format } from "date-fns";
import { NextResponse } from "next/server";
import { bookingInputSchema } from "@/lib/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildBookingSummary, getAvailableTimeSlots } from "@/lib/booking";
import {
  createCalendarBookingEvent,
  cancelCalendarEvent,
  GoogleCalendarError,
} from "@/lib/google-calendar";
import { createGoogleCalendarAddLink, generateIcs } from "@/lib/ics";
import { sendBarberNotificationEmail, sendCustomerConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bookingInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking payload" }, { status: 400 });
  }

  const input = parsed.data;
  const startsAt = new Date(input.startsAt);

  const supabase = getSupabaseAdmin();
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", input.serviceId)
    .eq("active", true)
    .single();

  if (serviceError || !service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const date = format(startsAt, "yyyy-MM-dd");
  const slots = await getAvailableTimeSlots(date, service.duration_minutes);
  const selectedSlot = slots.find((slot) => slot.startsAt === startsAt.toISOString());

  if (!selectedSlot) {
    return NextResponse.json({ error: "Selected slot is no longer available" }, { status: 409 });
  }

  const endsAt = addMinutes(startsAt, service.duration_minutes);
  const description = buildBookingSummary({
    serviceName: service.name,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    notes: input.notes,
  });

  let calendarEventId: string | undefined;
  let bookingId: string | undefined;

  try {
    const calendarEvent = await createCalendarBookingEvent({
      summary: `${service.name} - ${input.customerName}`,
      description,
      start: startsAt,
      end: endsAt,
    });
    calendarEventId = calendarEvent.id ?? undefined;

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        service_id: service.id,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        notes: input.notes || null,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: "confirmed",
        google_calendar_event_id: calendarEvent.id,
      })
      .select("*")
      .single();

    if (bookingError || !booking) {
      throw new Error(bookingError?.message ?? "Failed to save booking");
    }
    bookingId = booking.id;

    const googleLink = createGoogleCalendarAddLink({
      title: `Barber Appointment - ${service.name}`,
      details: description,
      startsAt,
      endsAt,
      location: "Tino Barber Studio",
    });

    const ics = generateIcs({
      uid: booking.id,
      title: `Barber Appointment - ${service.name}`,
      description,
      location: "Tino Barber Studio",
      startsAt,
      endsAt,
    });

    const emailResults = await Promise.allSettled([
      sendCustomerConfirmationEmail({
        to: input.customerEmail,
        customerName: input.customerName,
        serviceName: service.name,
        startsAt,
        endsAt,
        notes: input.notes,
        addToGoogleCalendarUrl: googleLink,
        icsContent: ics,
      }),
      sendBarberNotificationEmail({
        to: input.customerEmail,
        customerName: input.customerName,
        serviceName: service.name,
        startsAt,
        endsAt,
        notes: input.notes,
        addToGoogleCalendarUrl: googleLink,
        icsContent: ics,
      }),
    ]);

    const emailErrors = emailResults
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => {
        const reason = result.reason;
        return reason instanceof Error ? reason.message : "Email delivery failed";
      });

    if (emailErrors.length > 0) {
      return NextResponse.json(
        {
          id: booking.id,
          warning: "Booking confirmed, but one or more emails failed to send.",
          emailErrors,
        },
        { status: 201 },
      );
    }

    return NextResponse.json({ id: booking.id }, { status: 201 });
  } catch (error) {
    if (calendarEventId && !bookingId) {
      await cancelCalendarEvent(calendarEventId).catch(() => null);
    }

    if (error instanceof GoogleCalendarError) {
      return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Booking failed" },
      { status: 500 },
    );
  }
}
