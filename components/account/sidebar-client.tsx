"use client";

import { cn } from "cn";
import { usePathname } from "next/navigation";

import { Link } from "@/components/ui/link";

import { type AccountLink, isAccountLinkActive } from "./links";

export function SidebarClient({ links }: { links: AccountLink[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="grid">
      {links.map((link) => {
        const isActive = isAccountLinkActive(link.href, pathname);
        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "type-body-sm flex min-h-10 items-center px-3 py-3 transition-colors",
              isActive
                ? "bg-ink-strong text-inverse"
                : "text-ink hover:bg-surface hover:text-ink-strong",
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
