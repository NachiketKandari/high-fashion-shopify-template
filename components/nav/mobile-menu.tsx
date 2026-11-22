"use client";

import { cn } from "cn";
import { Menu as MenuIcon, Search, ShoppingBag, UserRoundPlus, X } from "lucide-react";
import Image from "next/image";
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";
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
const PANEL_LINK_CLASS = "type-h4 focus-ring flex transition-colors hover:text-ink-muted";

export function MobileMenu() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const item = MAIN_NAV[activeIndex];

  const closeMenu = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeMenu, open]);

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
        aria-expanded={open}
        aria-label="Open menu"
        className="focus-ring flex size-9 items-center justify-center text-ink"
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <MenuIcon className="size-6" strokeWidth={1.5} />
      </button>

      {/* Visibility is delayed so the panel stays painted through the close wipe. */}
      <div
        aria-hidden={!open}
        aria-label={open ? `${navLabel(item.label)} menu` : undefined}
        aria-modal={open || undefined}
        className={cn(
          "fixed inset-0 z-(--z-overlay) flex h-dvh flex-col bg-paper outline-none transition-[clip-path,visibility] duration-(--motion-base) ease-(--ease-standard) motion-reduce:transition-none desktop:hidden",
          open
            ? "visible [clip-path:inset(0_0_0_0)] [transition-delay:0s]"
            : "pointer-events-none invisible [clip-path:inset(0_0_100%_0)] [transition-delay:0s,var(--motion-base)]",
        )}
        data-open={open}
        id="mobile-menu"
        inert={!open}
        onKeyDown={handleKeyDown}
        ref={panelRef}
        role={open ? "dialog" : undefined}
        tabIndex={-1}
      >
        <div className="flex h-(--header-bar-h) shrink-0 items-center justify-between gap-4 px-(--gutter)">
          <div className="flex items-center gap-5">
            {MAIN_NAV.map((entry, index) => (
              <button
                aria-pressed={activeIndex === index}
                className={`${NAV_ITEM_CLASS} aria-pressed:underline aria-pressed:underline-offset-4`}
                key={entry.label}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                {navLabel(entry.label)}
              </button>
            ))}
          </div>
          <div className="flex items-center">
            {shopConfig.search.isEnabled ? (
              <Link aria-label="Search" className={PANEL_ICON_CLASS} href="/search">
                <Search className="size-6" strokeWidth={1.5} />
              </Link>
            ) : null}
            <Link aria-label="Bag" className={PANEL_ICON_CLASS} href="/cart">
              <ShoppingBag className="size-6" strokeWidth={1.5} />
            </Link>
            <Link aria-label="Account" className={PANEL_ICON_CLASS} href="/account">
              <UserRoundPlus className="size-6" strokeWidth={1.5} />
            </Link>
            <button
              aria-label="Close menu"
              className={PANEL_ICON_CLASS}
              onClick={closeMenu}
              type="button"
            >
              <X
                className={cn(
                  "size-6 transition-transform duration-(--motion-base) ease-(--ease-standard) motion-reduce:transition-none",
                  open ? "rotate-0" : "rotate-90",
                )}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
          <div className="px-(--gutter) pt-6">
            <ul className="grid gap-6" role="list">
              {item.columns?.[0]?.links.map((link) => (
                <li key={link.label}>
                  <Link
                    className={`${PANEL_LINK_CLASS} text-ink`}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="mt-24 grid gap-3" role="list">
              {UTILITY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    className={`${PANEL_LINK_CLASS} text-ink-muted`}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {open ? (
            <div className="mt-12 grid">
              {item.tiles?.map((tile) => (
                <Link
                  className="relative block aspect-[440/442] overflow-hidden bg-surface"
                  href={tile.href}
                  key={`${tile.href}-${tile.label}`}
                  onClick={() => setOpen(false)}
                >
                  <Image alt="" className="object-cover" fill sizes="100vw" src={tile.image} />
                  <span className="type-nav absolute bottom-6 left-6 text-inverse uppercase">
                    {tile.label}
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
