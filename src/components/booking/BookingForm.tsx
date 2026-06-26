"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { ServiceCard } from "@/components/booking/ServiceCard";
import { DatePicker } from "@/components/booking/DatePicker";
import { TimeSlotGrid } from "@/components/booking/TimeSlotGrid";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Service, TimeSlot } from "@/lib/types";

type BookingFormProps = {
  services: Service[];
};

type FormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
};

export function BookingForm({ services }: BookingFormProps) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  });
  const timeSectionRef = useRef<HTMLDivElement | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId),
    [services, serviceId],
  );

  useEffect(() => {
    if (!serviceId || !date) return;

    const controller = new AbortController();
    (async () => {
      setLoadingSlots(true);
      setError(null);
      try {
        const response = await fetch(`/api/availability?serviceId=${serviceId}&date=${date}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { slots?: TimeSlot[]; error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to fetch availability");
        }

        setSlots(data.slots ?? []);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Unable to load time slots. Please try another date.");
        }
      } finally {
        setLoadingSlots(false);
      }
    })();

    return () => controller.abort();
  }, [serviceId, date]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedService || !selectedSlot) {
      setError("Please select a service and time slot.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          startsAt: selectedSlot.startsAt,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          notes: form.notes,
        }),
      });

      const body = (await response.json()) as { id?: string; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Booking failed");

      setSuccessId(body.id ?? "ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleServiceSelect(nextServiceId: string) {
    setServiceId(nextServiceId);
    setSelectedSlot(null);

    const section = timeSectionRef.current;
    if (!section) return;

    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (successId) {
    return (
      <Card className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">Confirmed</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Appointment booked</h2>
        <p className="mt-3 text-zinc-300">
          We sent a confirmation email with an ICS invite and Add to Google Calendar link.
        </p>
        <p className="mt-3 text-sm text-zinc-400">Booking reference: {successId}</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Card>
          <h2 className="text-xl font-semibold text-white">1. Choose service</h2>
          <div className="mt-4 grid gap-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={service.id === serviceId}
                onSelect={handleServiceSelect}
              />
            ))}
          </div>
        </Card>

        <div ref={timeSectionRef}>
          <Card>
          <h2 className="text-xl font-semibold text-white">2. Choose date and time</h2>
          <div className="mt-4 space-y-4">
            <DatePicker
              value={date}
              onChange={(nextDate) => {
                setDate(nextDate);
                setSelectedSlot(null);
              }}
            />
            {loadingSlots ? (
              <p className="text-sm text-zinc-400">Loading available slots...</p>
            ) : (
              <TimeSlotGrid
                slots={slots}
                selectedStart={selectedSlot?.startsAt}
                onSelect={setSelectedSlot}
              />
            )}
          </div>
          </Card>
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-white">3. Your details</h2>
          <div className="mt-4 grid gap-3">
            <input
              required
              placeholder="Full Name"
              value={form.customerName}
              onChange={(event) => setForm((prev) => ({ ...prev, customerName: event.target.value }))}
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-zinc-200"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.customerEmail}
              onChange={(event) => setForm((prev) => ({ ...prev, customerEmail: event.target.value }))}
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-zinc-200"
            />
            <input
              required
              placeholder="Phone Number"
              value={form.customerPhone}
              onChange={(event) => setForm((prev) => ({ ...prev, customerPhone: event.target.value }))}
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-zinc-200"
            />
            <textarea
              rows={4}
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-zinc-200"
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button type="submit" disabled={submitting || !selectedSlot || !selectedService}>
              {submitting ? "Booking..." : "Confirm booking"}
            </Button>
            {selectedSlot ? (
              <p className="text-sm text-zinc-400">
                {format(new Date(selectedSlot.startsAt), "EEE, MMM d h:mm a")}
              </p>
            ) : null}
          </div>

          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        </Card>
      </div>

      <div className="lg:sticky lg:top-20 lg:h-fit">
        <BookingSummary service={selectedService} slot={selectedSlot ?? undefined} />
      </div>
    </form>
  );
}
