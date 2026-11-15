"use client";

import { XIcon } from "lucide-react";
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
                className="invisible absolute top-full left-0 z-40 w-[231px] translate-y-1 border-r border-b border-rule bg-paper opacity-0 transition-[opacity,transform,visibility] duration-(--motion-base) ease-(--ease-standard) data-[open=true]:visible data-[open=true]:translate-y-0 data-[open=true]:opacity-100"
                data-open={openIndex === index}
                id={`mega-${index}`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-rule pr-2 pl-5">
                  <p className="type-h4">{item.columns[0]?.title.toUpperCase()}</p>
                  <button
                    aria-label="Close menu"
                    className="focus-ring flex size-9 cursor-pointer items-center justify-center"
                    onClick={() => setOpenIndex(null)}
                    type="button"
                  >
                    <XIcon className="size-4" strokeWidth={1.25} />
                  </button>
                </div>
                <div className="grid gap-6 px-5 py-5">
                  {item.columns.map((column, columnIndex) => (
                    <div className="grid gap-1" key={column.title}>
                      {columnIndex > 0 ? (
                        <p className="type-label mb-1 text-ink-muted">{column.title}</p>
                      ) : null}
                      <ul className="grid" role="list">
                        {column.links.map((link) => (
                          <li key={link.label}>
                            <Link
                              className="type-h4 flex min-h-9 items-center transition-opacity hover:opacity-60"
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
