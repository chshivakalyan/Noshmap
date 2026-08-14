"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Home",
    href: "/",
    icon: "⌂",
  },
  {
    name: "Discover",
    href: "/discover",
    icon: "⌕",
  },
  {
    name: "Log",
    href: "/log",
    icon: "+",
  },
  {
    name: "Activity",
    href: "/activity",
    icon: "♡",
  },
  {
    name: "Profile",
    href: "/profile",
    icon: "○",
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e7e4de] bg-[#faf9f6]/95 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between py-2">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          const isLog = link.name === "Log";

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-w-14 flex-col items-center gap-1 text-xs ${
                active ? "text-black" : "text-neutral-400"
              }`}
            >
              <span
                className={
                  isLog
                    ? "flex h-10 w-10 items-center justify-center rounded-full bg-black text-xl text-white"
                    : "text-xl leading-none"
                }
              >
                {link.icon}
              </span>

              {!isLog && <span>{link.name}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}