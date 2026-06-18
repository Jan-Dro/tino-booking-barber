import { clsx } from "clsx";
import type { TimeSlot } from "@/lib/types";

type TimeSlotGridProps = {
  slots: TimeSlot[];
  selectedStart?: string;
  onSelect: (slot: TimeSlot) => void;
};

export function TimeSlotGrid({ slots, selectedStart, onSelect }: TimeSlotGridProps) {
  if (!slots.length) {
    return <p className="text-sm text-zinc-400">No available slots for this date.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => (
        <button
          key={slot.startsAt}
          type="button"
          onClick={() => onSelect(slot)}
          className={clsx(
            "rounded-lg border px-3 py-2 text-sm",
            slot.startsAt === selectedStart
              ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
              : "border-white/15 bg-black/40 text-zinc-300 hover:border-white/30",
          )}
        >
          {slot.label}
        </button>
      ))}
    </div>
  );
}
