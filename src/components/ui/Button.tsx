import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[var(--accent)] text-black hover:brightness-95",
        variant === "secondary" && "bg-[var(--surface-2)] text-[var(--text)] hover:bg-zinc-800",
        variant === "danger" && "bg-red-500/90 text-white hover:bg-red-500",
        className,
      )}
      {...props}
    />
  );
}
