import { format } from "date-fns";
import { Resend } from "resend";
import { getServerEnv } from "@/lib/env";

type BookingEmailInput = {
  to: string;
  customerName: string;
  serviceName: string;
  startsAt: Date;
  endsAt: Date;
  notes?: string | null;
  addToGoogleCalendarUrl: string;
  icsContent: string;
};

function getResendClient() {
  const env = getServerEnv();
  if (!env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(env.RESEND_API_KEY);
}

function formatWindow(startsAt: Date, endsAt: Date) {
  return `${format(startsAt, "EEEE, MMM d yyyy")}, ${format(startsAt, "h:mm a")} - ${format(endsAt, "h:mm a")}`;
}

function getFromAddress() {
  const env = getServerEnv();
  return env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
}

export async function sendCustomerConfirmationEmail(input: BookingEmailInput) {
  const client = getResendClient();
  if (!client) return;

  const when = formatWindow(input.startsAt, input.endsAt);

  const response = await client.emails.send({
    from: getFromAddress(),
    to: [input.to],
    subject: `Your appointment is confirmed - ${input.serviceName}`,
    html: `<p>Hi ${input.customerName},</p><p>Your appointment is confirmed.</p><p><strong>${input.serviceName}</strong><br/>${when}</p><p><a href="${input.addToGoogleCalendarUrl}">Add to Google Calendar</a></p><p>ICS file attached for Apple/Outlook calendars.</p>`,
    attachments: [
      {
        filename: "appointment.ics",
        content: Buffer.from(input.icsContent).toString("base64"),
      },
    ],
  });

  if (response.error) {
    throw new Error(`Resend customer email failed: ${response.error.message}`);
  }
}

export async function sendBarberNotificationEmail(input: BookingEmailInput) {
  const client = getResendClient();
  const env = getServerEnv();
  if (!client || !env.BARBER_EMAIL) return;

  const when = formatWindow(input.startsAt, input.endsAt);

  const response = await client.emails.send({
    from: getFromAddress(),
    to: [env.BARBER_EMAIL],
    subject: `New booking: ${input.serviceName}`,
    html: `<p>New booking received.</p><p><strong>${input.customerName}</strong><br/>${input.to}</p><p>${when}</p><p>Notes: ${input.notes ?? "None"}</p>`,
  });

  if (response.error) {
    throw new Error(`Resend barber email failed: ${response.error.message}`);
  }
}

export async function sendCancellationEmails(input: BookingEmailInput) {
  const client = getResendClient();
  const env = getServerEnv();
  if (!client) return;

  const when = formatWindow(input.startsAt, input.endsAt);

  const sends = [
    client.emails.send({
      from: getFromAddress(),
      to: [input.to],
      subject: "Your appointment has been cancelled",
      html: `<p>Hi ${input.customerName},</p><p>Your appointment for ${input.serviceName} on ${when} has been cancelled.</p>`,
    }),
  ];

  if (env.BARBER_EMAIL) {
    sends.push(
      client.emails.send({
        from: getFromAddress(),
        to: [env.BARBER_EMAIL],
        subject: "Booking cancelled",
        html: `<p>${input.customerName} cancelled ${input.serviceName} on ${when}.</p>`,
      }),
    );
  }

  const results = await Promise.all(sends);
  for (const result of results) {
    if (result.error) {
      throw new Error(`Resend cancellation email failed: ${result.error.message}`);
    }
  }
}
