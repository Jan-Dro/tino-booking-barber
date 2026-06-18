export type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  active: boolean;
  created_at: string;
};

export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  google_calendar_event_id: string | null;
  created_at: string;
  service?: Service;
};

export type TimeSlot = {
  startsAt: string;
  endsAt: string;
  label: string;
};

export type CalendarBlock = {
  start: Date;
  end: Date;
};
