"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Link } from "@/components/ui/link";
import { MAIN_NAV, SECONDARY_NAV } from "@/lib/nav";

import { NAV_CHIP_CLASS } from "./nav-chip";

// The 390 frames show only the closed bar, so the open state follows the desktop panel:
// the active category's links in two columns over one image.
export function MobileMenu() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const item = openIndex === null ? null : MAIN_NAV[openIndex];

  useEffect(() => {
    if (!item) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
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

  return (
    <>
      <button
        aria-controls="mobile-menu"
        aria-expanded={openIndex !== null}
        aria-label={openIndex === null ? "Open menu" : "Close menu"}
        className={`${NAV_CHIP_CLASS} desktop:hidden`}
        onClick={() => setOpenIndex(openIndex === null ? 0 : null)}
        ref={triggerRef}
        type="button"
      >
        Menu
      </button>

      {openIndex !== null ? (
        <div
          aria-label={MAIN_NAV[openIndex].label}
          aria-modal="true"
          className="fixed inset-0 z-(--z-overlay) flex flex-col bg-paper desktop:hidden"
          id="mobile-menu"
          role="dialog"
        >
          <div className="flex h-(--header-bar-h) shrink-0 items-center justify-between gap-2.5 px-(--gutter)">
            <div className="flex items-center gap-2.5">
              {MAIN_NAV.map((entry, index) => (
                <button
                  aria-pressed={openIndex === index}
                  className={NAV_CHIP_CLASS}
                  key={entry.label}
                  onClick={() => setOpenIndex(index)}
                  type="button"
                >
                  {entry.label}
                </button>
              ))}
            </div>
            <button
              aria-label="Close menu"
              className="focus-ring flex size-9 items-center justify-center"
              onClick={() => setOpenIndex(null)}
              ref={closeRef}
              type="button"
            >
              <X className="size-4" strokeWidth={1.25} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-(--gutter) pt-6">
            <p className="type-body text-ink-muted">
              {MAIN_NAV[openIndex].columns?.[0]?.title.toUpperCase()}
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4" role="list">
              {MAIN_NAV[openIndex].columns?.[0]?.links.map((link) => (
                <li key={link.label}>
                  <Link
                    className="type-body focus-ring flex h-11 items-center"
                    href={link.href}
                    onClick={() => setOpenIndex(null)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {MAIN_NAV[openIndex].tiles?.[0] ? (
              <div className="relative mt-8 aspect-[4/5] overflow-hidden bg-surface">
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="100vw"
                  src={MAIN_NAV[openIndex].tiles[0].image}
                />
              </div>
            ) : null}

            <ul className="mt-8 grid gap-3 border-t border-rule pt-6 pb-6" role="list">
              {SECONDARY_NAV.map((entry) => (
                <li key={entry.label}>
                  <Link
                    className="type-body focus-ring flex h-11 items-center"
                    href={entry.href}
                    onClick={() => setOpenIndex(null)}
                  >
                    {entry.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
