"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowser();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-white">Admin sign in</h1>
      <p className="mt-2 text-sm text-zinc-400">Use your Supabase Auth credentials.</p>

      <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
          className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-zinc-200"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
          className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-zinc-200"
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </form>
    </Card>
  );
}
