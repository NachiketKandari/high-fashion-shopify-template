"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";

import { Link } from "@/components/ui/link";

interface ProductRailProps {
  children: ReactNode;
  href: string;
  title: string;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    track.scrollBy({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      left: direction * track.clientWidth * 0.7,
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scroll(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scroll(1);
    }
  }

  return (
    <section className="pb-4 pt-[30px]">
      <div className="flex items-center justify-between px-(--gutter)">
        <h2 className="type-h2">
          <Link className="focus-ring flex min-h-9 items-center" href={href}>
            {title}
          </Link>
        </h2>
        <div className="flex items-center gap-4">
          <Link className="type-control focus-ring flex h-9 items-center" href={href}>
            View all
          </Link>
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous slide"
              className="focus-ring flex size-9 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canScrollLeft}
              onClick={() => scroll(-1)}
              type="button"
            >
              <ChevronLeft className="size-4" strokeWidth={1.25} />
            </button>
            <button
              aria-label="Next slide"
              className="focus-ring flex size-9 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
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
        className="scrollbar-hide mt-7 flex gap-(--grid-gap) overflow-x-auto px-(--gutter) pb-1"
        onKeyDown={handleKeyDown}
        ref={trackRef}
        tabIndex={0}
      >
        {children}
      </div>
    </section>
  );
}
