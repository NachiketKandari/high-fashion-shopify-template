"use client";

import { cn } from "cn";
import { X } from "lucide-react";
import Image from "next/image";
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

import { Link } from "@/components/ui/link";
import { MAIN_NAV } from "@/lib/nav";

import { NAV_ITEM_CLASS, NAV_PANEL_ITEM_CLASS, navLabel } from "./nav-chip";

// Built from menu-woman (2022:2660) and menu-man (1:309).
const UTILITY_LINKS = [
  { href: "/account", label: "My Account" },
  { href: "/policies/shipping-policy", label: "Delivery" },
  { href: "/policies/refund-policy", label: "Returns" },
  { href: "/pages/contact-us", label: "Contact Us" },
];

const PANEL_LINK_CLASS = "type-h4 focus-ring flex transition-colors hover:text-ink-muted";

export function DesktopNav() {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const brandRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const brandBarRef = useRef<HTMLDivElement>(null);
  const openIndexRef = useRef<number | null>(null);
  const isOpen = openIndex !== null;
  const activeIndex = openIndex ?? selectedIndex;
  const dimmedIndex = hoveredIndex ?? focusedIndex;
  const item = MAIN_NAV[activeIndex];

  const selectIndex = useCallback((index: number) => {
    openIndexRef.current = index;
    setSelectedIndex(index);
    setOpenIndex(index);
  }, []);

  const closePanel = useCallback((restoreFocus = true) => {
    const closingIndex = openIndexRef.current;
    openIndexRef.current = null;
    setFocusedIndex(null);
    setHoveredIndex(null);
    setOpenIndex(null);
    if (restoreFocus && closingIndex !== null) {
      triggerRefs.current[closingIndex]?.focus();
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const selectedBrand =
      openIndexRef.current === null ? null : brandRefs.current[openIndexRef.current];
    if (selectedBrand) selectedBrand.focus();
    else panelRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closePanel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closePanel, isOpen]);

  useEffect(() => {
    const measure = () => {
      const bar = brandBarRef.current;
      const brand = brandRefs.current[activeIndex];
      if (!bar || !brand) return;
      const barRect = bar.getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      setUnderline({ left: brandRect.left - barRect.left, width: brandRect.width });
    };
    measure();
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) measure();
    });
    window.addEventListener("resize", measure);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
    };
  }, [activeIndex]);

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
        <ul
          className="flex items-center gap-6"
          onBlur={(event) => {
            const next = event.relatedTarget;
            if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
              setFocusedIndex(null);
            }
          }}
          onMouseLeave={() => setHoveredIndex(null)}
          role="list"
        >
          {MAIN_NAV.map((entry, index) => (
            <li key={entry.label} onMouseEnter={() => setHoveredIndex(index)}>
              <button
                aria-controls="nav-panel"
                aria-expanded={openIndex === index}
                className={cn(NAV_ITEM_CLASS, "data-[dimmed=true]:text-ink-muted")}
                data-dimmed={dimmedIndex !== null && dimmedIndex !== index ? true : undefined}
                onFocus={() => setFocusedIndex(index)}
                onClick={() => (openIndex === index ? closePanel() : selectIndex(index))}
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

      {/* The backdrop and panel stay mounted so the close wipe can finish. */}
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-(--z-overlay) bg-black/20 transition-opacity duration-(--motion-base) ease-(--ease-standard) motion-reduce:transition-none",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => closePanel()}
      />
      <div
        aria-hidden={!isOpen}
        aria-label={isOpen ? `${navLabel(item.label)} menu` : undefined}
        aria-modal={isOpen || undefined}
        className={cn(
          "fixed inset-y-0 left-0 z-(--z-overlay) hidden h-dvh w-[709px] max-w-full flex-col bg-paper outline-none transition-[clip-path,visibility] [transition-duration:var(--motion-long),0s] ease-(--ease-standard) motion-reduce:transition-none desktop:flex",
          isOpen
            ? "visible [clip-path:inset(0_0_0_0)] [transition-delay:0s]"
            : "pointer-events-none invisible [clip-path:inset(0_100%_0_0)] [transition-delay:0s,var(--motion-long)]",
        )}
        data-open={isOpen}
        id="nav-panel"
        inert={!isOpen}
        onKeyDown={handleKeyDown}
        ref={panelRef}
        role={isOpen ? "dialog" : undefined}
        tabIndex={-1}
      >
        <div className="flex h-[74px] shrink-0 items-center justify-between px-6">
          <div className="relative flex items-center gap-6" ref={brandBarRef}>
            {MAIN_NAV.map((entry, index) => (
              <button
                aria-pressed={index === activeIndex}
                className={NAV_PANEL_ITEM_CLASS}
                key={entry.label}
                onClick={() => selectIndex(index)}
                onFocus={() => {
                  if (isOpen) selectIndex(index);
                }}
                onMouseEnter={() => {
                  if (isOpen) selectIndex(index);
                }}
                ref={(element) => {
                  brandRefs.current[index] = element;
                }}
                type="button"
              >
                {navLabel(entry.label)}
              </button>
            ))}
            <Link className={NAV_ITEM_CLASS} href="/search" onClick={() => closePanel(false)}>
              Search
            </Link>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2 left-0 h-px bg-ink transition-[width,transform] duration-(--motion-underline) ease-(--ease-standard) motion-reduce:transition-none"
              style={{ transform: `translateX(${underline.left}px)`, width: underline.width }}
            />
          </div>
          <button
            aria-label="Close menu"
            className="focus-ring flex size-9 items-center justify-center"
            onClick={() => closePanel()}
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
                      onClick={() => closePanel(false)}
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
                    onClick={() => closePanel(false)}
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
                onClick={() => closePanel(false)}
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
  );
}
