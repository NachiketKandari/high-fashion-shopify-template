"use client";

import { cn } from "cn";
import { usePathname } from "next/navigation";

import { Link } from "@/components/ui/link";

interface AccountSidebarLink {
  href: string;
  label: string;
}

export function SidebarClient({ links }: { links: AccountSidebarLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "type-body-sm flex min-h-9 items-center px-3 transition-colors",
            pathname.startsWith(link.href)
              ? "bg-surface font-normal text-ink"
              : "text-ink-muted hover:bg-surface hover:text-ink",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
