import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 py-8 text-sm text-zinc-400">
      <Container className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>Tino Barber Studio</p>
        <p>Precision cuts and premium grooming.</p>
      </Container>
    </footer>
  );
}
