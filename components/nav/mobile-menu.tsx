"use client";

import { Menu as MenuIcon, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Link } from "@/components/ui/link";
import { MAIN_NAV } from "@/lib/nav";

// Built from Mobile Menu-Women (2022:4641) and Mobile Menu-Men (2022:4768).
const UTILITY_LINKS = [
  { href: "/account", label: "My Account" },
  { href: "/policies/shipping-policy", label: "Delivery" },
  { href: "/policies/refund-policy", label: "Return" },
  { href: "/pages/contact-us", label: "Contact Us" },
];

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
        className="focus-ring flex size-9 items-center justify-center text-ink"
        onClick={() => setOpenIndex(openIndex === null ? 0 : null)}
        ref={triggerRef}
        type="button"
      >
        <MenuIcon className="size-5" strokeWidth={1.25} />
      </button>

      {item ? (
        <div
          aria-label={item.label}
          aria-modal="true"
          className="fixed inset-0 z-(--z-overlay) flex flex-col overflow-y-auto bg-paper desktop:hidden"
          id="mobile-menu"
          role="dialog"
        >
          <div className="flex h-[74px] shrink-0 items-center justify-between px-6">
            <div className="flex items-center gap-6">
              {MAIN_NAV.map((entry, index) => (
                <button
                  aria-pressed={openIndex === index}
                  className="type-nav focus-ring cursor-pointer py-2 text-ink"
                  key={entry.label}
                  onClick={() => setOpenIndex(index)}
                  type="button"
                >
                  {entry.label}
                </button>
              ))}
              <Link className="type-nav focus-ring py-2 text-ink" href="/search">
                Search
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                aria-label="Search"
                className="focus-ring flex size-6 items-center justify-center"
                href="/search"
              >
                <Search className="size-5" strokeWidth={1.25} />
              </Link>
              <Link
                aria-label="Bag"
                className="focus-ring flex size-8 items-center justify-center"
                href="/cart"
              >
                <ShoppingBag className="size-5" strokeWidth={1.25} />
              </Link>
              <Link
                aria-label="Account"
                className="focus-ring flex size-6 items-center justify-center"
                href="/account"
              >
                <UserRound className="size-5" strokeWidth={1.25} />
              </Link>
              <button
                aria-label="Close menu"
                className="focus-ring flex size-6 cursor-pointer items-center justify-center"
                onClick={() => setOpenIndex(null)}
                ref={closeRef}
                type="button"
              >
                <X className="size-4" strokeWidth={1.25} />
              </button>
            </div>
          </div>

          <div className="grid gap-24 px-6 pt-6">
            <div className="grid gap-6">
              <ul className="grid gap-4" role="list">
                {item.columns?.[0]?.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="type-h3 focus-ring flex min-h-5 items-center text-ink"
                      href={link.href}
                      onClick={() => setOpenIndex(null)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <ul className="grid gap-3" role="list">
                {UTILITY_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="type-h3 focus-ring flex min-h-5 items-center text-ink-muted"
                      href={link.href}
                      onClick={() => setOpenIndex(null)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 grid">
            {item.tiles?.map((tile) => (
              <Link
                className="relative block aspect-square overflow-hidden bg-surface"
                href={tile.href}
                key={`${tile.href}-${tile.label}`}
                onClick={() => setOpenIndex(null)}
              >
                <Image alt="" className="object-cover" fill sizes="100vw" src={tile.image} />
                <span className="type-h4 absolute bottom-6 left-5 text-inverse uppercase">
                  {tile.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
