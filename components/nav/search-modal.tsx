"use client";

import { Dialog } from "@base-ui/react/dialog";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { SearchExplorer } from "@/components/search/search-explorer";
import { Container } from "@/components/ui/container";

import { NAV_ITEM_CLASS } from "./nav-chip";

interface SearchModalProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function SearchModal({ onOpenChange, open }: SearchModalProps) {
  const pathname = usePathname();
  const onSearchPage = pathname === "/search";

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if (event.key !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      if (onSearchPage) {
        document.getElementById("search-input")?.focus();
        return;
      }
      onOpenChange(!open);
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [onSearchPage, open, onOpenChange]);

  useEffect(() => {
    if (onSearchPage && open) onOpenChange(false);
  }, [onSearchPage, open, onOpenChange]);

  if (onSearchPage) {
    return (
      <button
        className={NAV_ITEM_CLASS}
        onClick={() => document.getElementById("search-input")?.focus()}
        type="button"
      >
        Search
      </button>
    );
  }

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Trigger
        render={
          <button
            className={`${NAV_ITEM_CLASS} ${open ? "invisible pointer-events-none" : ""}`}
            type="button"
          >
            Search
          </button>
        }
      />
      <Dialog.Portal>
        <Dialog.Popup
          aria-modal="true"
          className="fixed inset-x-0 top-(--header-bar-h) bottom-0 z-(--z-overlay) flex flex-col overflow-y-auto overscroll-contain bg-paper outline-none"
          initialFocus={() => document.getElementById("search-drawer-input")}
          role="dialog"
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <Container className="max-w-[1440px] pt-(--page-top) pb-10 desktop:pt-20 desktop:pb-20">
            <SearchExplorer inputId="search-drawer-input" onClose={() => onOpenChange(false)} />
          </Container>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
