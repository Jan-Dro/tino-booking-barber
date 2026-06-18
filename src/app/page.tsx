import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <main>
      <section className="pt-16 pb-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Premium Barber Studio
            </p>
            <h1 className="mt-4 font-display text-5xl leading-tight text-[var(--text)] sm:text-6xl">
              Sharp cuts. Clean fades. Built around your time.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-300">
              Book in minutes with live availability powered directly by our Google Calendar.
            </p>
            <div className="mt-8">
              <Link
                href="/book"
                className="inline-flex rounded-lg bg-[var(--accent)] px-5 py-3 font-semibold text-black transition hover:brightness-95"
              >
                Book Appointment
              </Link>
            </div>
          </div>

          {/* <div className="relative h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#3a2b18,#111,#0a0a0a)] p-6 sm:h-[460px]">
            <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_20%_20%,#d8a86c,transparent_35%),radial-gradient(circle_at_80%_80%,#3f2d18,transparent_32%)]" />
            <div className="relative flex h-full items-end">
              <p className="max-w-xs rounded-lg bg-black/40 p-3 text-sm text-zinc-200">
                Professional barber image placeholder. Replace with your signature studio photo.
              </p>
            </div>
          </div> */}
        </Container>
      </section>

      <section id="services" className="py-14">
        <Container>
          <h2 className="font-display text-3xl text-white">Services</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <h3 className="text-xl font-semibold text-white">Kids Haircut or Fade</h3>
              <p className="mt-2 text-zinc-400">Kids under 18 regular haircut or fade.</p>
              <p className="mt-3 font-semibold text-[var(--accent)]">$25</p>
            </Card>
            <Card>
              <h3 className="text-xl font-semibold text-white">Men&apos;s Regular Haircut</h3>
              <p className="mt-2 text-zinc-400">Men&apos;s regular haircut / corte clasico.</p>
              <p className="mt-3 font-semibold text-[var(--accent)]">$25</p>
            </Card>
            <Card>
              <h3 className="text-xl font-semibold text-white">Men Fade</h3>
              <p className="mt-2 text-zinc-400">Fade / degradado with blend and finish.</p>
              <p className="mt-3 font-semibold text-[var(--accent)]">$30</p>
            </Card>
            <Card>
              <h3 className="text-xl font-semibold text-white">Beard</h3>
              <p className="mt-2 text-zinc-400">Beard / barba clean-up add-on.</p>
              <p className="mt-3 font-semibold text-[var(--accent)]">$5</p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="about" className="py-14">
        <Container className="grid gap-5 md:grid-cols-2">
          <Card>
            <h2 className="font-display text-3xl text-white">About</h2>
            <p className="mt-3 text-zinc-300">
              Tino Barber focuses on premium grooming in a calm, modern studio environment. Every
              appointment is paced for quality, not speed.
            </p>
          </Card>
          <Card>
            <h2 className="font-display text-3xl text-white">Contact</h2>
            <div id="contact" className="mt-3 space-y-2 text-zinc-300">
              <p>5345 Linda Ln, Katy, TX 77493</p>
              <p>(346) 827-5171</p>
              <p>tino@resrva.co</p>
            </div>
          </Card>
        </Container>
      </section>
    </main>
  );
}
