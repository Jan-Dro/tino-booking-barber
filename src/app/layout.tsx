import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tino Barber | Premium Barber Booking",
  description: "Book premium barber appointments with real-time Google Calendar availability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--bg)] text-[var(--text)]">
        <div className="relative min-h-full overflow-x-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(183,134,72,.22),transparent_40%)]" />
          <Navbar />
          <div className="relative z-10">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
