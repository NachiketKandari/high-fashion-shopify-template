"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { DesktopNav } from "./desktop-nav";
import { Header } from "./header";
import { SearchModal } from "./search-modal";

const HOVER_OPEN_DELAY_MS = 200;
const HOVER_CLOSE_DELAY_MS = 150;

interface NavChromeProps {
  actions: ReactNode;
  mobileActions?: ReactNode;
  searchEnabled: boolean;
}

export function NavChrome({ actions, mobileActions, searchEnabled }: NavChromeProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const handleTriggerPointerEnter = useCallback(
    (index?: number) => {
      if (searchOpen) return;
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      if (menuOpen) {
        if (index !== undefined) setActiveIndex(index);
        return;
      }
      if (openTimerRef.current !== null) {
        clearTimeout(openTimerRef.current);
      }
      openTimerRef.current = setTimeout(() => {
        openTimerRef.current = null;
        if (index !== undefined) setActiveIndex(index);
        setMenuOpen(true);
      }, HOVER_OPEN_DELAY_MS);
    },
    [menuOpen, searchOpen],
  );

  const handleTriggerPointerLeave = useCallback(() => {
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const handlePanelPointerEnter = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const handlePanelPointerLeave = useCallback(() => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setMenuOpen(false);
    }, HOVER_CLOSE_DELAY_MS);
  }, [clearTimers]);

  const handleMenuOpenChange = useCallback(
    (open: boolean) => {
      clearTimers();
      setMenuOpen(open);
    },
    [clearTimers],
  );

  const handleSearchOpenChange = useCallback(
    (open: boolean) => {
      clearTimers();
      if (open) setMenuOpen(false);
      setSearchOpen(open);
    },
    [clearTimers],
  );

  return (
    <Header
      actions={actions}
      desktopNav={
        <DesktopNav
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onOpenChange={handleMenuOpenChange}
          onPanelPointerEnter={handlePanelPointerEnter}
          onPanelPointerLeave={handlePanelPointerLeave}
          onTriggerPointerEnter={handleTriggerPointerEnter}
          onTriggerPointerLeave={handleTriggerPointerLeave}
          open={menuOpen}
        />
      }
      mobileActions={mobileActions}
      search={
        searchEnabled ? (
          <SearchModal
            onOpenChange={handleSearchOpenChange}
            onTriggerPointerEnter={(event) => {
              if (event.pointerType === "mouse") handleTriggerPointerEnter();
            }}
            onTriggerPointerLeave={(event) => {
              if (event.pointerType === "mouse") handleTriggerPointerLeave();
            }}
            open={searchOpen}
          />
        ) : null
      }
      searchOpen={searchOpen}
    />
  );
}
