"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { Link } from "@/components/ui/link";

interface ProductRailProps {
  children: ReactNode;
  href: string;
  title: string;
}

export function ProductRail({ children, href, title }: ProductRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const sync = () => {
      setCanScrollLeft(track.scrollLeft > 4);
      setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
    };
    sync();
    track.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, []);

  function scroll(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ behavior: "smooth", left: direction * track.clientWidth * 0.7 });
  }

  return (
    <section className="pb-4 pt-10">
      <div className="flex items-center justify-between px-5 md:px-[30px]">
        <h2 className="text-base uppercase tracking-wider">
          <Link href={href}>{title}</Link>
        </h2>
        <div className="flex items-center gap-4">
          <Link className="text-2xs uppercase tracking-wider" href={href}>
            View all
          </Link>
          <div className="flex items-center gap-2">
            <button
              aria-label="Previous slide"
              className="flex size-8 items-center justify-center disabled:opacity-30"
              disabled={!canScrollLeft}
              onClick={() => scroll(-1)}
              type="button"
            >
              <ChevronLeft className="size-4" strokeWidth={1.25} />
            </button>
            <button
              aria-label="Next slide"
              className="flex size-8 items-center justify-center disabled:opacity-30"
              disabled={!canScrollRight}
              onClick={() => scroll(1)}
              type="button"
            >
              <ChevronRight className="size-4" strokeWidth={1.25} />
            </button>
          </div>
        </div>
      </div>
      <div
        aria-label={`${title} products`}
        className="scrollbar-hide mt-7 flex gap-2.5 overflow-x-auto px-5 pb-1 md:px-[30px]"
        ref={trackRef}
        tabIndex={0}
      >
        {children}
      </div>
    </section>
  );
}
