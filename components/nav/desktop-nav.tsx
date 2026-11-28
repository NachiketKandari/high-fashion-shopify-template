"use client";

"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import Image from "next/image";

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

interface DesktopNavProps {
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onOpenChange: (open: boolean) => void;
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
  onTriggerPointerDown: () => void;
  onTriggerPointerEnter: (index: number) => void;
  onTriggerPointerLeave: () => void;
  open: boolean;
}

export function DesktopNav({
  activeIndex,
  onActiveIndexChange,
  onOpenChange,
  onPanelPointerEnter,
  onPanelPointerLeave,
  onTriggerPointerDown,
  onTriggerPointerEnter,
  onTriggerPointerLeave,
  open,
}: DesktopNavProps) {
  const item = MAIN_NAV[activeIndex];

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <nav aria-label="Menu" className="hidden desktop:block">
        <ul className="flex items-center gap-6" role="list">
          {MAIN_NAV.map((entry, index) => (
            <li key={entry.label}>
              <Link
                className={NAV_ITEM_CLASS}
                href={entry.href}
                onClick={() => onOpenChange(false)}
                onPointerDown={onTriggerPointerDown}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") onTriggerPointerEnter(index);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse") onTriggerPointerLeave();
                }}
              >
                {navLabel(entry.label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-(--z-overlay) bg-ink-strong/20 transition-opacity duration-(--motion-base) ease-(--ease-standard) motion-reduce:transition-none data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          aria-label={`${navLabel(item.label)} menu`}
          className="fixed inset-y-0 left-0 z-(--z-overlay) hidden h-dvh w-[709px] max-w-full flex-col bg-paper outline-none transition-[opacity,transform] duration-(--motion-base) ease-(--ease-standard) motion-reduce:transition-none data-ending-style:-translate-x-2 data-ending-style:opacity-0 data-starting-style:-translate-x-2 data-starting-style:opacity-0 desktop:flex"
          id="nav-panel"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") onPanelPointerEnter();
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") onPanelPointerLeave();
          }}
        >
          <div className="flex h-[74px] shrink-0 items-center justify-between px-6">
            <div className="flex items-center gap-6">
              {MAIN_NAV.map((entry, index) => (
                <Link
                  className={`${NAV_ITEM_CLASS} data-[active=true]:underline data-[active=true]:underline-offset-4`}
                  data-active={entry.label === item.label}
                  href={entry.href}
                  key={entry.label}
                  onClick={() => onOpenChange(false)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") onActiveIndexChange(index);
                  }}
                >
                  {navLabel(entry.label)}
                </Link>
              ))}
              <Link className={NAV_ITEM_CLASS} href="/search" onClick={() => onOpenChange(false)}>
                Search
              </Link>
            </div>
            <button
              aria-label="Close menu"
              className="focus-ring flex size-9 items-center justify-center"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              <X className="size-4" strokeWidth={1.25} />
            </button>
          </div>

          <div
            className="grid min-h-0 flex-1 grid-cols-2 animate-in fade-in duration-(--motion-fast) motion-reduce:animate-none"
            key={item.label}
          >
            <div className="flex min-h-0 flex-col">
              <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
                <ul className="grid gap-4" role="list">
                  {item.columns?.[0]?.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        className={`${PANEL_LINK_CLASS} text-ink`}
                        href={link.href}
                        onClick={() => onOpenChange(false)}
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
                      onClick={() => onOpenChange(false)}
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
                  onClick={() => onOpenChange(false)}
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
