"use client";

import { getSearchResultUrl } from "@shopify/hydrogen";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { Link } from "@/components/ui/link";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useRecentlyViewedProducts } from "@/lib/product/client";
import { SEARCH_TERM_MAX_LENGTH } from "@/lib/search";
import { usePredictiveSearch } from "@/lib/search/client";

export function SearchModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            aria-label="Search"
            className="flex cursor-pointer items-center justify-center text-xs uppercase tracking-wider transition-opacity hover:opacity-60"
            type="button"
          >
            <Search className="size-4 xl:hidden" strokeWidth={1.25} />
            <span className="hidden xl:inline">Search</span>
          </button>
        }
      />
      <SearchDrawer open={open} onClose={() => setOpen(false)} />
    </Sheet>
  );
}

function SearchDrawer({ onClose, open }: { onClose: () => void; open: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { query, reset, results, isLoading, setQuery } = usePredictiveSearch();
  const recentlyViewed = useRecentlyViewedProducts(open);
  const hasQuery = query.trim().length > 0;
  const products = hasQuery ? (results?.products ?? []) : recentlyViewed;

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, reset]);

  function navigate(href: string) {
    router.push(href);
    requestAnimationFrame(onClose);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    navigate(getSearchResultUrl({ baseUrl: "/search", term }));
  }

  return (
    <SheetContent
      className="w-full max-w-[440px] gap-0 border-l border-rule p-0"
      closeButton={false}
      side="right"
    >
      <SheetTitle className="sr-only">Search</SheetTitle>
      <div className="flex h-14 shrink-0 items-center justify-end px-5">
        <SheetClose
          aria-label="Close search"
          className="flex size-9 items-center justify-center"
          type="button"
        >
          <X className="size-4" strokeWidth={1.25} />
        </SheetClose>
      </div>

      <form className="px-5" onSubmit={handleSubmit}>
        <label className="block text-xs uppercase tracking-wider" htmlFor="search-drawer-input">
          Search
        </label>
        <div className="mt-2 flex items-center gap-3 border-b border-foreground pb-2">
          <input
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            id="search-drawer-input"
            maxLength={SEARCH_TERM_MAX_LENGTH}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type to search"
            ref={inputRef}
            type="search"
            value={query}
          />
          {query ? (
            <button
              aria-label="Clear search"
              className="text-muted-foreground"
              onClick={() => {
                reset();
                inputRef.current?.focus();
              }}
              type="button"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
          <button className="text-xs uppercase tracking-wider" type="submit">
            Search
          </button>
        </div>
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        {isLoading && products.length === 0 ? (
          <div className="grid gap-4">
            {[0, 1, 2].map((item) => (
              <div className="flex items-center gap-4" key={item}>
                <div className="h-15 w-10 animate-pulse bg-surface" />
                <div className="h-3 w-40 animate-pulse bg-surface" />
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && products.length > 0 ? (
          <>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {hasQuery ? "Suggestions" : "Recently viewed"}
            </p>
            <ul className="mt-4 grid gap-4" role="list">
              {products.map((product) => (
                <li key={product.id}>
                  <button
                    className="flex w-full items-center gap-4 text-left"
                    onClick={() => navigate(`/products/${product.handle}`)}
                    type="button"
                  >
                    <span className="relative block h-15 w-10 shrink-0 overflow-hidden bg-surface">
                      {product.featuredImage ? (
                        <Image
                          alt={product.featuredImage.altText || product.title}
                          className="object-cover"
                          fill
                          sizes="100vw"
                          src={product.featuredImage.url}
                        />
                      ) : null}
                    </span>
                    <span className="text-xs uppercase tracking-wider">{product.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {!isLoading && hasQuery && products.length === 0 ? (
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            No results for “{query}”
          </p>
        ) : null}

        {hasQuery ? (
          <Link
            className="mt-8 inline-block text-xs uppercase tracking-wider underline underline-offset-4"
            href={getSearchResultUrl({ baseUrl: "/search", term: query.trim() })}
            onClick={(event) => {
              event.preventDefault();
              navigate(getSearchResultUrl({ baseUrl: "/search", term: query.trim() }));
            }}
          >
            View all results
          </Link>
        ) : null}
      </div>
    </SheetContent>
  );
}
