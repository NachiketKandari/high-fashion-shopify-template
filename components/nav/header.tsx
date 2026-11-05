"use client";

import { cn } from "cn";
import { usePathname } from "next/navigation";
import { type ReactNode, useSyncExternalStore } from "react";

import { Wordmark } from "@/components/brand/wordmark";

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
          isHome ? "h-14 desktop:h-[186px]" : "h-14 desktop:h-[76px]",
        )}
        data-app-header
        data-scrolled={scrolled}
      >
        <div className="pointer-events-auto bg-paper">
          <div
            className={cn(
              "overflow-hidden transition-[height] duration-(--motion-base) ease-(--ease-standard)",
              showMasthead ? "h-0 desktop:h-(--header-masthead-h)" : "h-0",
            )}
            data-masthead
          >
            {showMasthead ? (
              <div className="hidden h-(--header-masthead-h) items-start px-(--gutter) desktop:flex">
                <Wordmark className="mt-7" variant="masthead" />
              </div>
            ) : null}
          </div>

          <div className="relative border-y border-rule">
            <div className="flex h-(--header-bar-h) items-center gap-1 px-(--gutter) desktop:gap-4">
              <Wordmark
                className={cn(
                  "transition-opacity duration-(--motion-base) ease-(--ease-standard)",
                  showMasthead && "desktop:pointer-events-none desktop:opacity-0",
                )}
                priority={!isHome}
                variant="compact"
              />

              <DesktopNav />

              <div className="ml-auto flex shrink-0 items-center gap-1 desktop:gap-4">
                {actions}
              </div>
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
