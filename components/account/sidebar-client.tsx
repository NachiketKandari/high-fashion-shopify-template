"use client";

import { cn } from "cn";
import { usePathname } from "next/navigation";

import { Link } from "@/components/ui/link";

import { type AccountLink, isAccountLinkActive } from "./links";

export function SidebarClient({ links }: { links: AccountLink[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="grid gap-1">
      {links.map((link) => {
        const active = isAccountLinkActive(pathname, link);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "type-body-sm flex min-h-9 items-center px-3 transition-colors",
              active ? "bg-ink text-inverse" : "text-ink hover:bg-surface",
            )}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
