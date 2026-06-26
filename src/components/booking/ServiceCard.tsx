import { Card } from "@/components/ui/Card";
import type { Service } from "@/lib/types";

type ServiceCardProps = {
  service: Service;
  selected?: boolean;
  onSelect?: (serviceId: string) => void;
};

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      className="w-full text-left"
      type="button"
      onClick={() => onSelect?.(service.id)}
      aria-pressed={selected}
    >
      <Card
        className={
          selected
            ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/40"
            : "hover:border-white/30"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--text)]">{service.name}</h3>
          {selected ? (
            <span className="rounded-full border border-[var(--accent)]/60 bg-[var(--accent)]/20 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              Selected
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-zinc-400">{service.description}</p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className={selected ? "font-semibold text-[var(--text)]" : "text-zinc-300"}>
            {service.duration_minutes} min
          </span>
          <span className="font-semibold text-[var(--accent)]">${(service.price_cents / 100).toFixed(2)}</span>
        </div>
      </Card>
    </button>
  );
}
