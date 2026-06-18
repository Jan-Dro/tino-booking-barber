import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-[var(--surface)] p-6 shadow-[0_20px_80px_-40px_rgba(0,0,0,.8)]",
        className,
      )}
      {...props}
    />
  );
}
