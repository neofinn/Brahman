import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brahman — your Sanatan Dharma purohit",
  description:
    "Ask a scripture-grounded priest about the Vedas, Upanishads, Puranas and epics; get today's panchang, your kundli, and step-by-step puja vidhi.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffaf2" },
    { media: "(prefers-color-scheme: dark)", color: "#1a120c" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              <span className="om deva" aria-hidden>ॐ</span>
              Brahman
              <span className="beta-badge" title="Beta version — feedback welcome">Beta</span>
            </Link>
            <Nav />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
