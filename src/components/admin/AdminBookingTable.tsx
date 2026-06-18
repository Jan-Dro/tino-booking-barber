"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import type { Booking } from "@/lib/types";

type AdminBookingTableProps = {
  initialBookings: Booking[];
};

export function AdminBookingTable({ initialBookings }: AdminBookingTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return bookings;

    return bookings.filter((booking) => {
      return [
        booking.customer_name,
        booking.customer_email,
        booking.customer_phone,
        booking.service?.name ?? "",
        booking.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [bookings, search]);

  async function readJsonSafely<T>(response: Response): Promise<T | null> {
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return null;
    }

    try {
      return (await response.json()) as T;
    } catch {
      return null;
    }
  }

  async function cancelBooking(id: string) {
    const response = await fetch(`/api/admin/bookings/${id}/cancel`, {
      method: "PATCH",
    });
    const body = (await readJsonSafely<{
      warning?: string;
      error?: string;
      emailErrors?: string[];
    }>(response)) ?? {};

    if (!response.ok) {
      setFeedback(body.error ?? "Cancel failed.");
      return;
    }

    if (body.warning || body.emailErrors?.length) {
      setFeedback(body.warning ?? body.emailErrors?.[0] ?? null);
    } else {
      setFeedback("Booking cancelled.");
    }

    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              status: "cancelled",
            }
          : booking,
      ),
    );
  }

  async function resendConfirmation(id: string) {
    const response = await fetch(`/api/admin/bookings/${id}/resend`, {
      method: "POST",
    });
    const body = (await readJsonSafely<{ success?: boolean; error?: string }>(response)) ?? {};

    if (!response.ok || body.success === false) {
      setFeedback(body.error ?? "Resend failed.");
      return;
    }

    setFeedback("Confirmation resent.");
  }

  return (
    <div className="space-y-4">
      {feedback ? (
        <p className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-zinc-300">
          {feedback}
        </p>
      ) : null}

      <input
        placeholder="Search by customer, phone, email, service..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-zinc-200"
      />

      {!filtered.length ? (
        <EmptyState title="No bookings found" description="Try a different search term." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-zinc-300">
              <tr>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((booking) => (
                <tr key={booking.id} className="bg-black/20">
                  <td className="px-4 py-3 text-zinc-200">
                    <p className="font-medium">{booking.customer_name}</p>
                    <p className="text-xs text-zinc-400">{booking.customer_email}</p>
                    <p className="text-xs text-zinc-500">{booking.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{booking.service?.name}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {format(new Date(booking.starts_at), "MMM d, h:mm a")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        booking.status === "confirmed"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => resendConfirmation(booking.id)}>
                        Resend
                      </Button>
                      <Button
                        variant="danger"
                        disabled={booking.status === "cancelled"}
                        onClick={() => cancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
