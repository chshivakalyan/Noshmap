"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Home", href: "/" },
  { name: "Discover", href: "/discover" },
  { name: "Diary", href: "/diary" },
  { name: "Lists", href: "/lists" },
  { name: "Map", href: "/map" },
  { name: "Profile", href: "/profile" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e4de] bg-[#faf9f6]/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          href="/"
          className="text-2xl font-black tracking-[-0.04em]"
        >
          nosh<span className="text-[#777]">Map</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "text-black"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-neutral-600 hover:text-black sm:block"
          >
            Log in
          </Link>

          <Link
            href="/log"
            className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            + Log
          </Link>
        </div>
      </div>
    </header>
  );
}