"use client";

import { cn } from "cn";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Link } from "@/components/ui/link";
import { MAIN_NAV } from "@/lib/nav";

const TRIGGER_CLASS =
  "type-nav relative inline-flex min-w-9 cursor-pointer items-center justify-center py-3 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-(--motion-underline) after:ease-(--ease-standard) hover:after:scale-x-100 focus-visible:after:scale-x-100 data-[open=true]:after:scale-x-100";

export function DesktopNav() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (openIndex === null) return;
    const triggerIndex = openIndex;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      triggerRefs.current[triggerIndex]?.focus();
      setOpenIndex(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openIndex]);

  return (
    <nav
      aria-label="Menu"
      className="hidden desktop:block"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpenIndex(null);
      }}
      onMouseLeave={() => setOpenIndex(null)}
    >
      <ul className="flex items-center gap-[25px]" role="list">
        {MAIN_NAV.map((item, index) =>
          item.columns ? (
            <li className="static" key={item.label}>
              <button
                aria-controls={`mega-${index}`}
                aria-expanded={openIndex === index}
                className={TRIGGER_CLASS}
                data-open={openIndex === index}
                onClick={() => setOpenIndex((current) => (current === index ? null : index))}
                onFocus={(event) => {
                  if (event.target.matches(":focus-visible")) setOpenIndex(index);
                }}
                onMouseEnter={() => setOpenIndex(index)}
                ref={(element) => {
                  triggerRefs.current[index] = element;
                }}
                type="button"
              >
                {item.label}
              </button>
              <div
                className="invisible absolute inset-x-0 top-full z-40 translate-y-1 border-b border-rule bg-paper opacity-0 transition-[opacity,transform,visibility] duration-(--motion-base) ease-(--ease-standard) data-[open=true]:visible data-[open=true]:translate-y-0 data-[open=true]:opacity-100"
                data-open={openIndex === index}
                id={`mega-${index}`}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(420px,520px)] gap-[60px] px-(--gutter) pt-9 pb-10">
                  <div className="grid grid-cols-3 gap-10">
                    {item.columns.map((column) => (
                      <div key={column.title}>
                        <p className="type-h4">{column.title}</p>
                        <ul className="mt-5 grid" role="list">
                          {column.links.map((link) => (
                            <li key={link.label}>
                              <Link
                                className="type-h4 block transition-opacity hover:opacity-60"
                                href={link.href}
                                onClick={() => setOpenIndex(null)}
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {item.tiles && item.tiles.length > 0 ? (
                    <div className="grid grid-cols-2 gap-[10px]">
                      {item.tiles.map((tile) => (
                        <Link
                          className="group/tile grid content-start"
                          href={tile.href}
                          key={tile.label}
                          onClick={() => setOpenIndex(null)}
                        >
                          <span className="relative block aspect-[260/418] overflow-hidden bg-surface">
                            <Image
                              alt={tile.label}
                              className="object-cover transition-transform duration-(--motion-image) ease-(--ease-standard) group-hover/tile:scale-[1.03] motion-reduce:transform-none"
                              fill
                              sizes="100vw"
                              src={tile.image}
                            />
                          </span>
                          <span className="type-h4 mt-2.5 block">{tile.label}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          ) : (
            <li key={item.label}>
              <Link className={TRIGGER_CLASS} href={item.href}>
                {item.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
