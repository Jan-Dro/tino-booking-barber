import { BookingForm } from "@/components/booking/BookingForm";
import { Container } from "@/components/ui/Container";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const supabase = getSupabaseAdmin();
  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  const hasServices = Boolean(services?.length);

  return (
    <main className="py-12">
      <Container>
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">Book online</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Reserve your appointment</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Real-time availability is pulled directly from Google Calendar.
        </p>

        <div className="mt-8">
          {error ? (
            <div className="rounded-xl border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-200">
              <p className="font-semibold">Unable to load services.</p>
              <p className="mt-1">Supabase error: {error.message}</p>
              <p className="mt-1">
                Apply the SQL in <code>supabase/schema.sql</code> to create the required tables.
              </p>
            </div>
          ) : !hasServices ? (
            <div className="rounded-xl border border-white/15 bg-black/30 p-4 text-sm text-zinc-300">
              No active services found. Add rows to the <code>services</code> table or run
              <code> supabase/schema.sql</code> seed data.
            </div>
          ) : (
            <BookingForm services={services} />
          )}
        </div>
      </Container>
    </main>
  );
}
