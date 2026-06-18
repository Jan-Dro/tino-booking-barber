import { Card } from "@/components/ui/Card";
import type { Service } from "@/lib/types";

type ServiceCardProps = {
  service: Service;
  selected?: boolean;
  onSelect?: (serviceId: string) => void;
};

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button className="w-full text-left" type="button" onClick={() => onSelect?.(service.id)}>
      <Card className={selected ? "border-[var(--accent)]" : ""}>
        <h3 className="text-lg font-semibold text-[var(--text)]">{service.name}</h3>
        <p className="mt-2 text-sm text-zinc-400">{service.description}</p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-zinc-300">{service.duration_minutes} min</span>
          <span className="font-semibold text-[var(--accent)]">${(service.price_cents / 100).toFixed(2)}</span>
        </div>
      </Card>
    </button>
  );
}
