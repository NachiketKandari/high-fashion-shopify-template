"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Link } from "@/components/ui/link";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MAIN_NAV } from "@/lib/nav";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            aria-label="Menu"
            className="flex size-9 items-center justify-center xl:hidden"
            type="button"
          >
            <Menu className="size-5" strokeWidth={1.25} />
          </button>
        }
      />
      <SheetContent
        className="w-full max-w-none gap-0 border-0 p-0"
        closeButton={false}
        side="right"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-rule px-5">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Image
            alt="Polite Society"
            className="h-[22px] w-auto"
            height={28}
            priority
            sizes="100vw"
            src="/reference/ps-wordmark.svg"
            width={342}
          />
          <SheetClose
            aria-label="Close menu"
            className="flex size-9 items-center justify-center"
            type="button"
          >
            <X className="size-5" strokeWidth={1.25} />
          </SheetClose>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">
          <ul className="grid" role="list">
            {MAIN_NAV.map((item) =>
              item.columns ? (
                <li className="border-b border-transparent" key={item.label}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-13 uppercase tracking-wider [&::-webkit-details-marker]:hidden">
                      {item.label}
                      <ChevronDown
                        className="size-4 transition-transform group-open:rotate-180"
                        strokeWidth={1.25}
                      />
                    </summary>
                    <div className="grid gap-5 pb-5 pl-1 pt-1">
                      {item.columns.map((column) => (
                        <div key={column.title}>
                          <p className="text-2xs uppercase tracking-wider text-muted-foreground">
                            {column.title}
                          </p>
                          <ul className="mt-2 grid gap-1" role="list">
                            {column.links.map((link) => (
                              <li key={link.label}>
                                <Link
                                  className="block py-1 text-13 uppercase tracking-wider"
                                  href={link.href}
                                  onClick={() => setOpen(false)}
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </details>
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    className="flex items-center justify-between py-3 text-13 uppercase tracking-wider"
                    href={item.href}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
            <li>
              <Link
                className="flex items-center justify-between py-3 text-13 uppercase tracking-wider"
                href="/wishlist"
                onClick={() => setOpen(false)}
              >
                Wishlist
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex h-14 shrink-0 items-center justify-between border-t border-rule px-5 text-2xs uppercase tracking-wider">
          <span>USD</span>
          <Link href="/account">Account</Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
