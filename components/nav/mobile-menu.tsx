"use client";

import { Menu as MenuIcon, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Image from "next/image";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { Link } from "@/components/ui/link";
import { MAIN_NAV } from "@/lib/nav";

import { NAV_ITEM_CLASS, navLabel } from "./nav-chip";

// Built from Mobile Menu-Women (2022:4641) and Mobile Menu-Men (2022:4768).
const UTILITY_LINKS = [
  { href: "/account", label: "My Account" },
  { href: "/policies/shipping-policy", label: "Delivery" },
  { href: "/policies/refund-policy", label: "Returns" },
  { href: "/pages/contact-us", label: "Contact Us" },
];

const PANEL_ICON_CLASS = "focus-ring flex size-9 items-center justify-center text-ink";

export function MobileMenu() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const item = openIndex === null ? null : MAIN_NAV[openIndex];

  useEffect(() => {
    if (!item) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenIndex(null);
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [item]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        aria-controls="mobile-menu"
        aria-expanded={openIndex !== null}
        aria-label={openIndex === null ? "Open menu" : "Close menu"}
        className="focus-ring flex size-9 items-center justify-center text-ink"
        onClick={() => setOpenIndex(openIndex === null ? 0 : null)}
        ref={triggerRef}
        type="button"
      >
        <MenuIcon className="size-5" strokeWidth={1.25} />
      </button>

      {item ? (
        <div
          aria-label={`${navLabel(item.label)} menu`}
          aria-modal="true"
          className="fixed inset-0 z-(--z-overlay) flex flex-col bg-paper outline-none desktop:hidden"
          id="mobile-menu"
          onKeyDown={handleKeyDown}
          ref={panelRef}
          role="dialog"
          tabIndex={-1}
        >
          <div className="flex h-[74px] shrink-0 items-center justify-between gap-4 px-6">
            <div className="flex items-center gap-6">
              {MAIN_NAV.map((entry, index) => (
                <button
                  aria-pressed={openIndex === index}
                  className={NAV_ITEM_CLASS}
                  key={entry.label}
                  onClick={() => setOpenIndex(index)}
                  type="button"
                >
                  {navLabel(entry.label)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link aria-label="Search" className={PANEL_ICON_CLASS} href="/search">
                <Search className="size-5" strokeWidth={1.25} />
              </Link>
              <Link aria-label="Bag" className={PANEL_ICON_CLASS} href="/cart">
                <ShoppingBag className="size-5" strokeWidth={1.25} />
              </Link>
              <Link aria-label="Account" className={PANEL_ICON_CLASS} href="/account">
                <UserRound className="size-5" strokeWidth={1.25} />
              </Link>
              <button
                aria-label="Close menu"
                className={PANEL_ICON_CLASS}
                onClick={() => setOpenIndex(null)}
                type="button"
              >
                <X className="size-5" strokeWidth={1.25} />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-6 pt-6">
              <ul className="grid gap-2" role="list">
                {item.columns?.[0]?.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="type-h3 focus-ring flex min-h-9 items-center text-ink"
                      href={link.href}
                      onClick={() => setOpenIndex(null)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <ul className="mt-24 grid gap-0" role="list">
                {UTILITY_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="type-h3 focus-ring flex min-h-9 items-center text-ink-muted"
                      href={link.href}
                      onClick={() => setOpenIndex(null)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 grid">
              {item.tiles?.map((tile) => (
                <Link
                  className="relative block aspect-square overflow-hidden bg-surface"
                  href={tile.href}
                  key={`${tile.href}-${tile.label}`}
                  onClick={() => setOpenIndex(null)}
                >
                  <Image alt="" className="object-cover" fill sizes="100vw" src={tile.image} />
                  <span className="type-nav absolute bottom-6 left-6 text-inverse uppercase">
                    {tile.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
