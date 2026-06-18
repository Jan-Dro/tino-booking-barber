"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";

export function Navbar() {
  const pathname = usePathname();
  const isTinoRoute = pathname === "/tino" || pathname.startsWith("/tino/");
  const homeHref = isTinoRoute ? "/tino" : "/";
  const bookHref = isTinoRoute ? "/tino/book" : "/book";
  const servicesHref = isTinoRoute ? "/tino#services" : "#services";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href={homeHref} className="text-lg font-bold tracking-[0.15em] text-[var(--text)]">
          TINO BARBER
        </Link>
        <nav className="flex items-center gap-5 text-sm text-zinc-300">
          <a href={servicesHref} className="hover:text-white">Services</a>
          <Link href={bookHref} className="rounded-lg bg-[var(--accent)] px-3 py-2 font-semibold text-black">
            Book
          </Link>
        </nav>
      </Container>
    </header>
  );
}
