import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import type { Service, TimeSlot } from "@/lib/types";

type BookingSummaryProps = {
  service?: Service;
  slot?: TimeSlot;
};

export function BookingSummary({ service, slot }: BookingSummaryProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-white">Booking summary</h3>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-zinc-400">Service</dt>
          <dd className="text-zinc-200">{service?.name ?? "Select service"}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-zinc-400">Duration</dt>
          <dd className="text-zinc-200">{service ? `${service.duration_minutes} min` : "-"}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-zinc-400">Price</dt>
          <dd className="text-zinc-200">
            {service ? `$${(service.price_cents / 100).toFixed(2)}` : "-"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-zinc-400">Time</dt>
          <dd className="text-zinc-200">
            {slot ? format(new Date(slot.startsAt), "EEE, MMM d h:mm a") : "Select a slot"}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
