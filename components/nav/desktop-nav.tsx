"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const item = MAIN_NAV[activeIndex];

  function openMenu(index: number) {
    setActiveIndex(index);
    setOpen(true);
  }

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <nav aria-label="Menu" className="hidden desktop:block">
        <ul className="flex items-center gap-6" role="list">
          {MAIN_NAV.map((entry, index) => (
            <li key={entry.label}>
              <button
                aria-controls="nav-panel"
                aria-expanded={open && activeIndex === index}
                className={NAV_ITEM_CLASS}
                onClick={() => openMenu(index)}
                type="button"
              >
                {navLabel(entry.label)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-(--z-overlay) bg-ink-strong/20 transition-opacity duration-(--motion-base) ease-(--ease-standard) motion-reduce:transition-none data-ending-style:opacity-0" />
        <Dialog.Popup
          aria-label={`${navLabel(item.label)} menu`}
          className="fixed inset-y-0 left-0 z-(--z-overlay) hidden h-dvh w-[709px] max-w-full flex-col bg-paper outline-none transition-[clip-path] duration-(--motion-base) ease-(--ease-standard) motion-reduce:transition-none [clip-path:inset(0_0_0_0)] data-ending-style:[clip-path:inset(0_100%_0_0)] data-starting-style:[clip-path:inset(0_100%_0_0)] desktop:flex"
          id="nav-panel"
        >
          <div className="flex h-[74px] shrink-0 items-center justify-between px-6">
            <div className="flex items-center gap-6">
              {MAIN_NAV.map((entry, index) => (
                <button
                  aria-pressed={entry.label === item.label}
                  className={`${NAV_ITEM_CLASS} aria-pressed:underline aria-pressed:underline-offset-4`}
                  key={entry.label}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                >
                  {navLabel(entry.label)}
                </button>
              ))}
              <Link className={NAV_ITEM_CLASS} href="/search" onClick={() => setOpen(false)}>
                Search
              </Link>
            </div>
            <button
              aria-label="Close menu"
              className="focus-ring flex size-9 items-center justify-center"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X className="size-4" strokeWidth={1.25} />
            </button>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2">
            <div className="flex min-h-0 flex-col">
              <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
                <ul className="grid gap-4" role="list">
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
              </div>

              <ul className="grid shrink-0 gap-3 px-6 py-6" role="list">
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

            <div className="scrollbar-subtle min-h-0 overflow-y-auto overscroll-contain">
              {item.tiles?.map((tile) => (
                <Link
                  className="relative block aspect-[354/442] shrink-0 overflow-hidden bg-surface"
                  href={tile.href}
                  key={`${tile.href}-${tile.label}`}
                  onClick={() => setOpen(false)}
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
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
