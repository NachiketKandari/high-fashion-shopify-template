"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useState } from "react";

import { Link } from "@/components/ui/link";

import { Announcement } from "./announcement";
import { DesktopNav } from "./desktop-nav";
import { MobileMenu } from "./mobile-menu";

export function Header({ actions }: { actions: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Announcement />
      <header className="sticky top-0 z-50" data-app-header data-scrolled={scrolled}>
        <div className="pointer-events-auto bg-background">
          <div
            className="overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(.2,.6,.2,1)]"
            data-masthead
          >
            <div className="flex h-[110px] items-start px-5 md:px-[30px]">
              <Link aria-label="Polite Society" className="mt-7 block max-w-[1016px]" href="/">
                <Image
                  alt="Polite Society"
                  className="h-auto w-[1016px] max-w-full"
                  height={82}
                  priority
                  sizes="100vw"
                  src="/reference/ps-wordmark.svg"
                  width={1016}
                />
              </Link>
            </div>
          </div>

          <div className="relative border-y border-rule">
            <div className="flex h-14 items-center gap-4 px-5 md:px-[30px] xl:h-[76px] xl:gap-8">
              <Link aria-label="Polite Society" className="shrink-0" data-compact-logo href="/">
                <Image
                  alt="Polite Society"
                  className="h-auto w-[170px] md:w-[250px] xl:w-[342px]"
                  height={28}
                  priority
                  sizes="100vw"
                  src="/reference/ps-wordmark.svg"
                  width={342}
                />
              </Link>

              <DesktopNav />

              <div className="ml-auto flex items-center gap-4 md:gap-6">{actions}</div>
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
