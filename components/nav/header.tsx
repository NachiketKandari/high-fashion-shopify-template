"use client";

import { cn } from "cn";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { type ReactNode, useSyncExternalStore } from "react";

import { Link } from "@/components/ui/link";

import { Announcement } from "./announcement";
import { DesktopNav } from "./desktop-nav";
import { MobileMenu } from "./mobile-menu";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function getScrolled() {
  return window.scrollY > 24;
}

function getServerScrolled() {
  return false;
}

export function Header({ actions }: { actions: ReactNode }) {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribeToScroll, getScrolled, getServerScrolled);
  const isHome = pathname === "/";
  const showMasthead = isHome && !scrolled;

  return (
    <>
      <Announcement />
      <header
        className={cn(
          "pointer-events-none sticky top-0 z-50",
          isHome ? "h-14 xl:h-[186px]" : "h-14 xl:h-[76px]",
        )}
        data-app-header
        data-scrolled={scrolled}
      >
        <div className="pointer-events-auto bg-background">
          <div
            className={cn(
              "overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(.2,.6,.2,1)]",
              showMasthead ? "h-0 xl:h-[110px]" : "h-0",
            )}
            data-masthead
          >
            {showMasthead ? (
              <div className="hidden h-[110px] items-start px-5 md:px-[30px] xl:flex">
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
            ) : null}
          </div>

          <div className="relative border-y border-rule">
            <div className="flex h-14 items-center gap-4 px-5 md:px-[30px] xl:h-[76px] xl:gap-8">
              <Link
                aria-label="Polite Society"
                className={cn("shrink-0", showMasthead && "xl:hidden")}
                data-compact-logo
                href="/"
              >
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
