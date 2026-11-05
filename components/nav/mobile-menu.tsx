"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";
import { MAIN_NAV } from "@/lib/nav";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="focus-ring flex size-9 shrink-0 cursor-pointer items-center justify-center desktop:hidden"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        {open ? (
          <X className="size-5" strokeWidth={1.25} />
        ) : (
          <Menu className="size-5" strokeWidth={1.25} />
        )}
      </button>

      {open ? (
        <div
          className="absolute inset-x-0 top-full z-40 flex h-[calc(100dvh-var(--header-bar-h)-var(--announcement-h))] flex-col border-b border-rule bg-paper desktop:hidden"
          id="mobile-menu"
        >
          <nav aria-label="Menu" className="min-h-0 flex-1 overflow-y-auto px-(--gutter) py-2">
            <ul className="grid" role="list">
              {MAIN_NAV.map((item) =>
                item.columns ? (
                  <li key={item.label}>
                    <details className="group">
                      <summary className="type-h3 flex h-[38px] cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
                        {item.label}
                        <ChevronDown
                          className="size-4 transition-transform duration-200 group-open:rotate-180"
                          strokeWidth={1.25}
                        />
                      </summary>
                      <div className="grid gap-5 pb-4 pl-1 pt-1">
                        {item.columns.map((column) => (
                          <div key={column.title}>
                            <p className="type-label text-ink-muted">{column.title}</p>
                            <ul className="mt-2 grid" role="list">
                              {column.links.map((link) => (
                                <li key={link.label}>
                                  <Link
                                    className="type-h4 flex h-[38px] items-center"
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
                      className="type-h3 flex h-[38px] items-center justify-between"
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
                  className="type-h3 flex h-[38px] items-center justify-between"
                  href="/pages/wishlist"
                  onClick={() => setOpen(false)}
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </nav>

          <div className="type-label flex h-14 shrink-0 items-center justify-between border-t border-rule px-(--gutter)">
            <span>USD</span>
            {shopConfig.auth.isEnabled ? <Link href="/account">Account</Link> : <span />}
          </div>
        </div>
      ) : null}
    </>
  );
}
