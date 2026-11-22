"use client";

import { cn } from "cn";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { Wordmark } from "@/components/brand/wordmark";

import { DesktopNav } from "./desktop-nav";
import { MobileMenu } from "./mobile-menu";

interface HeaderProps {
  actions: ReactNode;
  mobileActions?: ReactNode;
  search?: ReactNode;
}

export function Header({ actions, mobileActions, search }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const solid = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="pointer-events-none sticky top-0 z-(--z-header) h-(--header-bar-h)"
      data-app-header
      data-scrolled={solid}
    >
      <div
        className={cn(
          "pointer-events-auto h-full transition-colors duration-(--motion-fast) ease-(--ease-standard)",
          solid ? "bg-paper" : "bg-transparent",
        )}
      >
        <div className="flex h-full items-center justify-between gap-0 px-(--gutter) desktop:hidden">
          <Wordmark variant="nav" />
          <div className="flex items-center gap-0">
            {mobileActions}
            <MobileMenu />
          </div>
        </div>

        <div className="hidden h-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-(--gutter) desktop:grid">
          <div className="flex min-w-0 items-center gap-6">
            <DesktopNav />
            {search}
          </div>

          <Wordmark className="justify-self-center" variant="nav" />

          <div className="flex min-w-0 items-center justify-end gap-6">{actions}</div>
        </div>
      </div>
    </header>
  );
}
