"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

import { Link } from "@/components/ui/link";

import { type AccountLink, isAccountLinkActive } from "./links";

interface AccountMobileMenuProps {
  links: AccountLink[];
  signOut: ReactNode;
}

export function AccountMobileMenu({ links, signOut }: AccountMobileMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const active = links.find((link) => isAccountLinkActive(link.href, pathname));

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <p className="type-body-sm text-ink-muted">My account</p>
        <p className="type-body-sm text-ink-strong">{active?.label ?? "Account"}</p>
      </div>
      <button
        aria-controls="account-menu"
        aria-expanded={isOpen}
        className="type-body-sm min-h-9 w-fit cursor-pointer text-left text-ink-strong"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        Account menu
      </button>
      <hr className="border-rule" />
      <nav aria-label="Account" className={isOpen ? "grid gap-1" : "hidden"} id="account-menu">
        {links.map((link) => {
          const isActive = isAccountLinkActive(link.href, pathname);
          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "type-body-sm flex min-h-10 items-center bg-ink-strong px-3 py-3 text-inverse"
                  : "type-body-sm flex min-h-10 items-center px-3 py-3 text-ink hover:bg-surface"
              }
              href={link.href}
              key={link.href}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          );
        })}
        {signOut}
      </nav>
    </div>
  );
}
