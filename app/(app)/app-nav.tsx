"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/home", label: "Upload" },
  { href: "/library", label: "Library" },
  { href: "/red-lines", label: "Red lines" },
];

// The signed-in header's navigation, so every screen is one click from the
// others. A document page counts as part of the library.
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="header-nav" aria-label="Main">
      {LINKS.map((link) => {
        const active =
          pathname === link.href || (link.href === "/library" && pathname.startsWith("/documents/"));
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
