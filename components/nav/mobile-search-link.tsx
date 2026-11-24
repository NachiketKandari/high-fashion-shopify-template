"use client";

import { SearchIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { Link } from "@/components/ui/link";

const SEARCH_LINK_CLASS = "focus-ring flex size-9 items-center justify-center text-ink";

// The search page is the search experience; the anchor would only link back to it.
export function MobileSearchLink() {
  const pathname = usePathname();
  if (pathname === "/search") return null;
  return (
    <Link aria-label="Search" className={SEARCH_LINK_CLASS} href="/search">
      <SearchIcon className="size-6" strokeWidth={1.5} />
    </Link>
  );
}
