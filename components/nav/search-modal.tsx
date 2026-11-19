"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SearchExplorer } from "@/components/search/search-explorer";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { NAV_ITEM_CLASS } from "./nav-chip";

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if (event.key !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      if (pathname === "/search") {
        document.getElementById("search-input")?.focus();
        return;
      }
      setOpen((previous) => !previous);
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [pathname]);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger
        render={
          <button className={pathname === "/search" ? "hidden" : NAV_ITEM_CLASS} type="button">
            Search
          </button>
        }
      />
      <SheetContent
        className="inset-0 h-dvh w-full max-w-full gap-0 rounded-none border-0 p-0 shadow-none"
        closeButton={false}
        side="top"
      >
        <SheetTitle className="sr-only">Search</SheetTitle>
        <div className="min-h-0 flex-1 overflow-y-auto px-(--gutter) pt-6 desktop:pt-1.5">
          <SearchExplorer
            autoFocus
            closeOnNavigate
            inputId="search-drawer-input"
            onClose={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
