import { redirect } from "next/navigation";
import { AdminBookingTable } from "@/components/admin/AdminBookingTable";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { Container } from "@/components/ui/Container";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authClient = await getSupabaseServer();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const supabase = getSupabaseAdmin();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, service:services(*)")
    .order("starts_at", { ascending: false });

  return (
    <main className="py-12">
      <Container>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">Admin</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Bookings dashboard</h1>
          </div>
          <AdminSignOutButton />
        </div>

        <AdminBookingTable initialBookings={bookings ?? []} />
      </Container>
    </main>
  );
}
