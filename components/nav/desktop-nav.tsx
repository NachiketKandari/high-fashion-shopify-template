"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { Link } from "@/components/ui/link";
import { MAIN_NAV } from "@/lib/nav";

import { NAV_ITEM_CLASS, navLabel } from "./nav-chip";

// Built from menu-woman (2022:2660) and menu-man (1:309).
const UTILITY_LINKS = [
  { href: "/account", label: "My Account" },
  { href: "/policies/shipping-policy", label: "Delivery" },
  { href: "/policies/refund-policy", label: "Returns" },
  { href: "/pages/contact-us", label: "Contact Us" },
];

const PANEL_LINK_CLASS = "type-h4 focus-ring flex transition-colors hover:text-ink-muted";

export function DesktopNav() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const item = openIndex === null ? null : MAIN_NAV[openIndex];

  useEffect(() => {
    if (openIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenIndex(null);
      triggerRefs.current[openIndex]?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex]);

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
      <nav aria-label="Menu" className="hidden desktop:block">
        <ul className="flex items-center gap-6" role="list">
          {MAIN_NAV.map((entry, index) => (
            <li key={entry.label}>
              <button
                aria-controls="nav-panel"
                aria-expanded={openIndex === index}
                className={NAV_ITEM_CLASS}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                ref={(element) => {
                  triggerRefs.current[index] = element;
                }}
                type="button"
              >
                {navLabel(entry.label)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {item ? (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-(--z-overlay) bg-black/20"
            onClick={() => setOpenIndex(null)}
          />
          <div
            aria-label={`${navLabel(item.label)} menu`}
            aria-modal="true"
            className="fixed inset-y-0 left-0 z-(--z-overlay) hidden h-dvh w-[709px] max-w-full flex-col bg-paper outline-none desktop:flex"
            id="nav-panel"
            onKeyDown={handleKeyDown}
            ref={panelRef}
            role="dialog"
            tabIndex={-1}
          >
            <div className="flex h-[74px] shrink-0 items-center justify-between px-6">
              <div className="flex items-center gap-6">
                {MAIN_NAV.map((entry, index) => (
                  <button
                    aria-pressed={entry.label === item.label}
                    className={`${NAV_ITEM_CLASS} aria-pressed:underline aria-pressed:underline-offset-4`}
                    key={entry.label}
                    onClick={() => setOpenIndex(index)}
                    type="button"
                  >
                    {navLabel(entry.label)}
                  </button>
                ))}
                <Link className={NAV_ITEM_CLASS} href="/search" onClick={() => setOpenIndex(null)}>
                  Search
                </Link>
              </div>
              <button
                aria-label="Close menu"
                className="focus-ring flex size-9 items-center justify-center"
                onClick={() => setOpenIndex(null)}
                type="button"
              >
                <X className="size-4" strokeWidth={1.25} />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-2">
              <div className="flex min-h-0 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
                  <ul className="grid gap-4" role="list">
                    {item.columns?.[0]?.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          className={`${PANEL_LINK_CLASS} text-ink`}
                          href={link.href}
                          onClick={() => setOpenIndex(null)}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <ul className="grid shrink-0 gap-3 px-6 py-6" role="list">
                  {UTILITY_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        className={`${PANEL_LINK_CLASS} text-ink-muted`}
                        href={link.href}
                        onClick={() => setOpenIndex(null)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-h-0 overflow-y-auto overscroll-contain">
                {item.tiles?.map((tile) => (
                  <Link
                    className="relative block aspect-[354/442] shrink-0 overflow-hidden bg-surface"
                    href={tile.href}
                    key={`${tile.href}-${tile.label}`}
                    onClick={() => setOpenIndex(null)}
                  >
                    <Image
                      alt=""
                      className="object-cover"
                      fill
                      sizes="(min-width: 1100px) 355px, 100vw"
                      src={tile.image}
                    />
                    <span className="type-nav absolute bottom-6 left-6 text-inverse uppercase">
                      {tile.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
