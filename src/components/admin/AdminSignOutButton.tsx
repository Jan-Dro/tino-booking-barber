"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function AdminSignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <Button variant="secondary" onClick={handleSignOut}>
      Sign out
    </Button>
  );
}
