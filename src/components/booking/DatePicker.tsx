type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DatePicker({ value, onChange }: DatePickerProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="booking-date">
        Select date
      </label>
      <input
        id="booking-date"
        type="date"
        value={value}
        min={new Date().toISOString().split("T")[0]}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
      />
    </div>
  );
}
