"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Link } from "@/components/ui/link";
import { MAIN_NAV } from "@/lib/nav";

import { NAV_CHIP_CLASS } from "./nav-chip";

export function DesktopNav() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const item = openIndex === null ? null : MAIN_NAV[openIndex];

  useEffect(() => {
    if (openIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
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

  return (
    <>
      <nav aria-label="Menu" className="hidden desktop:block">
        <ul className="flex items-center gap-2.5" role="list">
          {MAIN_NAV.map((entry, index) => (
            <li key={entry.label}>
              <button
                aria-controls="nav-panel"
                aria-expanded={openIndex === index}
                className={NAV_CHIP_CLASS}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                ref={(element) => {
                  triggerRefs.current[index] = element;
                }}
                type="button"
              >
                {entry.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {item ? (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-(--z-header) bg-black/20"
            onClick={() => setOpenIndex(null)}
          />
          <div
            aria-label={item.label}
            aria-modal="true"
            className="fixed inset-y-0 left-0 z-(--z-overlay) flex w-[592px] max-w-full flex-col bg-paper"
            id="nav-panel"
            role="dialog"
          >
            <div className="flex h-[73px] shrink-0 items-center justify-between px-6">
              <div className="flex items-center gap-2.5">
                {MAIN_NAV.map((entry, index) => (
                  <button
                    aria-pressed={entry.label === item.label}
                    className={NAV_CHIP_CLASS}
                    key={entry.label}
                    onClick={() => setOpenIndex(index)}
                    type="button"
                  >
                    {entry.label}
                  </button>
                ))}
                <Link className={NAV_CHIP_CLASS} href="/search" onClick={() => setOpenIndex(null)}>
                  Search
                </Link>
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

            <div className="grid min-h-0 flex-1 content-start gap-8 overflow-y-auto px-6 py-6">
              <p className="type-body text-ink-muted">{item.columns?.[0]?.title.toUpperCase()}</p>
              <ul className="grid gap-6" role="list">
                {item.columns?.[0]?.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="type-body focus-ring inline-flex items-center"
                      href={link.href}
                      onClick={() => setOpenIndex(null)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <p className="type-body shrink-0 px-6 py-6">Lorem Ipsum</p>
          </div>
        </>
      ) : null}
    </>
  );
}
