"use client";

import { Dialog } from "@base-ui/react/dialog";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SearchExplorer } from "@/components/search/search-explorer";
import { Container } from "@/components/ui/container";

import { NAV_ITEM_CLASS } from "./nav-chip";

const SEARCH_SIBLING_DIM_CLASS =
  "group-has-[nav:focus-within]/navleft:text-ink-muted group-has-[nav:hover]/navleft:text-ink-muted";

export function SearchModal() {
  const [open, setOpen] = useState(false);
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
      setOpen((previous) => !previous);
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [onSearchPage]);

  if (onSearchPage) {
    return (
      <button
        className={`${NAV_ITEM_CLASS} ${SEARCH_SIBLING_DIM_CLASS}`}
        onClick={() => document.getElementById("search-input")?.focus()}
        type="button"
      >
        Search
      </button>
    );
  }

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <Dialog.Trigger
        render={
          <button
            className={`${NAV_ITEM_CLASS} ${SEARCH_SIBLING_DIM_CLASS} ${open ? "invisible pointer-events-none" : ""}`}
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
          <Container className="pt-(--page-top) pb-10 desktop:pt-10 desktop:pb-20">
            <SearchExplorer
              closeOnNavigate
              inputId="search-drawer-input"
              onClose={() => setOpen(false)}
            />
          </Container>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
