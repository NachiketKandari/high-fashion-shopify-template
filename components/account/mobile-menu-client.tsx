"use client";

import { cn } from "cn";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

import { Link } from "@/components/ui/link";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { type AccountLink, getAccountPageLabel, isAccountLinkActive } from "./links";

export function MobileMenuClient({ links, signOut }: { links: AccountLink[]; signOut: ReactNode }) {
  const pathname = usePathname();
  const currentLabel = getAccountPageLabel(pathname);
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-3">
      <div className="grid gap-3">
        <p className="type-body-sm text-ink-muted">My account</p>
        <p className="type-body-sm text-ink">{currentLabel}</p>
      </div>
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetTrigger className="type-body-sm focus-ring flex min-h-9 w-full cursor-pointer items-center justify-between gap-4 text-left text-ink">
          Account menu
          <ChevronDownIcon aria-hidden="true" className="size-3.5" strokeWidth={1.25} />
        </SheetTrigger>
        <SheetContent
          className="w-(--drawer-search) max-w-full gap-0 border-l border-rule p-0"
          closeButton={false}
          side="right"
        >
          <div className="flex h-14 shrink-0 items-center justify-between px-4">
            <SheetTitle>Account menu</SheetTitle>
            <button
              aria-label="Close account menu"
              className="focus-ring flex size-9 cursor-pointer items-center justify-center"
              onClick={() => setOpen(false)}
              type="button"
            >
              <XIcon aria-hidden="true" className="size-4" strokeWidth={1.25} />
            </button>
          </div>
          <nav aria-label="Account" className="grid px-2">
            {links.map((link) => {
              const active = isAccountLinkActive(pathname, link);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "type-body-sm flex min-h-11 items-center px-4 text-left transition-colors",
                    active ? "bg-ink text-inverse" : "text-ink hover:bg-surface",
                  )}
                  href={link.href}
                  key={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-2 border-t border-rule px-2 pt-2">{signOut}</div>
        </SheetContent>
      </Sheet>
      <hr className="border-rule" />
    </div>
  );
}
