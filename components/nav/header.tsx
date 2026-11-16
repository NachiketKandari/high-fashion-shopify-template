"use client";

import type { ReactNode } from "react";

import { Wordmark } from "@/components/brand/wordmark";

import { DesktopNav } from "./desktop-nav";
import { MobileMenu } from "./mobile-menu";

export function Header({ actions, search }: { actions: ReactNode; search?: ReactNode }) {
  return (
    <>
      <header
        className="pointer-events-none sticky top-0 z-(--z-header) h-(--header-bar-h)"
        data-app-header
      >
        <div className="pointer-events-auto h-full border-b border-rule bg-paper">
          <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-(--gutter)">
            <div className="flex min-w-0 items-center gap-2.5">
              <DesktopNav />
              {search}
              <MobileMenu />
            </div>

            <Wordmark className="justify-self-center" priority variant="nav" />

            <div className="flex min-w-0 items-center justify-end gap-2.5 desktop:gap-6">
              {actions}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
