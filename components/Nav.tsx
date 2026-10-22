"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/chat", label: "Ask Brahman" },
  { href: "/panchang", label: "Panchang" },
  { href: "/kundli", label: "Kundli" },
  { href: "/kriyas", label: "Puja & Hawan" },
  { href: "/katha", label: "Katha" },
  { href: "/library", label: "Scriptures" },
  { href: "/profile", label: "My details" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="nav" aria-label="Main">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={pathname.startsWith(l.href) ? "active" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
