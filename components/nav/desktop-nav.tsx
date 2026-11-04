"use client";

import { cn } from "cn";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Link } from "@/components/ui/link";
import { MAIN_NAV } from "@/lib/nav";

const TRIGGER_CLASS =
  "relative inline-flex cursor-pointer items-center py-3 text-13 uppercase tracking-wider after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 hover:after:scale-x-100 data-[open=true]:after:scale-x-100";

export function DesktopNav() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenIndex(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openIndex]);

  return (
    <nav
      aria-label="Menu"
      className="hidden xl:block"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpenIndex(null);
      }}
      onMouseLeave={() => setOpenIndex(null)}
    >
      <ul className="flex items-center gap-6 xl:gap-8" role="list">
        {MAIN_NAV.map((item, index) =>
          item.columns ? (
            <li className="static" key={item.label}>
              <button
                aria-controls={`mega-${index}`}
                aria-expanded={openIndex === index}
                aria-haspopup="true"
                className={cn(TRIGGER_CLASS, "bg-transparent")}
                data-open={openIndex === index}
                onClick={() => setOpenIndex((current) => (current === index ? null : index))}
                onFocus={() => setOpenIndex(index)}
                onMouseEnter={() => setOpenIndex(index)}
                type="button"
              >
                {item.label}
              </button>
              <div
                className="invisible absolute inset-x-0 top-full z-40 translate-y-1 border-b border-rule bg-background opacity-0 transition-[opacity,transform,visibility] duration-300 data-[open=true]:visible data-[open=true]:translate-y-0 data-[open=true]:opacity-100"
                data-open={openIndex === index}
                id={`mega-${index}`}
              >
                <div className="grid grid-cols-[1.5fr_1fr] gap-15 px-[30px] py-9">
                  <div className="grid grid-cols-3 gap-10">
                    {item.columns.map((column) => (
                      <div key={column.title}>
                        <p className="text-2xs uppercase tracking-wider">{column.title}</p>
                        <ul className="mt-5 grid" role="list">
                          {column.links.map((link) => (
                            <li key={link.label}>
                              <Link
                                className="block text-2xs uppercase leading-[25px] tracking-wider text-foreground transition-opacity hover:opacity-60"
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
                    <div className="grid grid-cols-2 gap-2.5">
                      {item.tiles.map((tile) => (
                        <Link
                          className="group/tile grid content-start"
                          href={tile.href}
                          key={tile.label}
                          onClick={() => setOpenIndex(null)}
                        >
                          <span className="relative block aspect-[254/360] overflow-hidden bg-surface">
                            <Image
                              alt={tile.label}
                              className="object-cover transition-transform duration-600 group-hover/tile:scale-[1.03]"
                              fill
                              sizes="100vw"
                              src={tile.image}
                            />
                          </span>
                          <span className="mt-2.5 block text-2xs uppercase tracking-wider">
                            {tile.label}
                          </span>
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
