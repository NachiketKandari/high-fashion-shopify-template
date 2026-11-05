"use client";

import { getSearchResultUrl } from "@shopify/hydrogen";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";

import { Link } from "@/components/ui/link";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useRecentlyViewedProducts } from "@/lib/product/client";
import { SEARCH_TERM_MAX_LENGTH } from "@/lib/search";
import { usePredictiveSearch } from "@/lib/search/client";

export function SearchModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
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
            className="focus-ring flex h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center transition-opacity hover:opacity-60"
            type="button"
          >
            <Search className="size-4 desktop:hidden" strokeWidth={1.25} />
            <span className="type-nav hidden desktop:inline">Search</span>
          </button>
        }
      />
      <SearchDrawer open={open} onClose={() => setOpen(false)} />
    </Sheet>
  );
}

interface SearchItem {
  href: string;
  id: string;
  kind: "collection" | "product" | "query";
  title: string;
  image?: { altText: string; url: string } | null;
}

function SearchDrawer({ onClose, open }: { onClose: () => void; open: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { activeIndex, query, reset, results, isLoading, setActiveIndex, setQuery } =
    usePredictiveSearch();
  const recentlyViewed = useRecentlyViewedProducts(open);
  const hasQuery = query.trim().length > 0;
  const products = hasQuery ? (results?.products ?? []) : recentlyViewed;
  const suggestions = hasQuery ? (results?.queries ?? []) : [];
  const collections = hasQuery ? (results?.collections ?? []) : [];
  const items: SearchItem[] = [
    ...suggestions.map((suggestion, index) => ({
      href: getSearchResultUrl({ baseUrl: "/search", term: suggestion.text }),
      id: `search-query-${index}`,
      kind: "query" as const,
      title: suggestion.text,
    })),
    ...collections.map((collection) => ({
      href: `/collections/${collection.handle}`,
      id: `search-collection-${collection.id}`,
      image: collection.image,
      kind: "collection" as const,
      title: collection.title,
    })),
    ...products.map((product) => ({
      href: `/products/${product.handle}`,
      id: `search-product-${product.id}`,
      image: product.featuredImage,
      kind: "product" as const,
      title: product.title,
    })),
  ];
  const resultCount = items.length;

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

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, items.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, -1));
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      const item = items[activeIndex];
      if (!item) return;
      event.preventDefault();
      navigate(item.href);
    }
  }

  return (
    <SheetContent
      className="w-(--drawer-search) max-w-full gap-0 border-l border-rule p-0"
      closeButton={false}
      side="right"
    >
      <SheetTitle className="sr-only">Search</SheetTitle>
      <div className="flex h-14 shrink-0 items-center justify-end px-(--gutter)">
        <SheetClose
          aria-label="Close search"
          className="focus-ring flex size-9 items-center justify-center"
          type="button"
        >
          <X className="size-4" strokeWidth={1.25} />
        </SheetClose>
      </div>

      <form className="px-(--gutter)" onSubmit={handleSubmit}>
        <label className="type-label block" htmlFor="search-drawer-input">
          Search
        </label>
        <div className="mt-2 flex items-center gap-3 border-b border-ink pb-2">
          <input
            aria-activedescendant={activeIndex >= 0 ? items[activeIndex]?.id : undefined}
            aria-autocomplete="list"
            aria-controls={hasQuery ? "search-drawer-list" : undefined}
            aria-expanded={hasQuery}
            autoComplete="off"
            className="type-body h-[35px] min-w-0 flex-1 border-0 bg-transparent px-0 text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            id="search-drawer-input"
            maxLength={SEARCH_TERM_MAX_LENGTH}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to search"
            ref={inputRef}
            role="combobox"
            type="search"
            value={query}
          />
          {query ? (
            <button
              aria-label="Clear search"
              className="focus-ring flex size-9 items-center justify-center text-ink-muted"
              onClick={() => {
                reset();
                inputRef.current?.focus();
              }}
              type="button"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
          <button className="type-control focus-ring flex h-9 items-center px-1" type="submit">
            Search
          </button>
        </div>
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto px-(--gutter) py-6" id="search-drawer-results">
        <p aria-live="polite" className="type-label text-ink-muted" role="status">
          {isLoading
            ? "Searching"
            : hasQuery
              ? `${resultCount} ${resultCount === 1 ? "result" : "results"}`
              : "Recently viewed"}
        </p>

        {isLoading && items.length === 0 ? (
          <div className="mt-4 grid gap-4">
            {[0, 1, 2].map((item) => (
              <div className="flex items-center gap-4" key={item}>
                <div className="h-15 w-10 animate-pulse bg-surface motion-reduce:animate-none" />
                <div className="h-3 w-40 animate-pulse bg-surface motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <ul className="mt-4 grid gap-2" id="search-drawer-list" role="listbox">
            {items.map((item, index) => (
              <li key={item.id} role="presentation">
                <button
                  aria-selected={activeIndex === index}
                  className="flex min-h-9 w-full items-center gap-4 text-left data-[active=true]:opacity-60"
                  data-active={activeIndex === index}
                  id={item.id}
                  onClick={() => navigate(item.href)}
                  onMouseEnter={() => setActiveIndex(index)}
                  role="option"
                  tabIndex={-1}
                  type="button"
                >
                  {item.kind === "product" || item.kind === "collection" ? (
                    <span className="relative block h-[60px] w-10 shrink-0 overflow-hidden bg-surface">
                      {item.image ? (
                        <Image
                          alt={item.image.altText || item.title}
                          className="object-cover"
                          fill
                          sizes="100vw"
                          src={item.image.url}
                        />
                      ) : null}
                    </span>
                  ) : (
                    <span className="flex size-10 shrink-0 items-center justify-center bg-surface">
                      <Search className="size-4" strokeWidth={1.25} />
                    </span>
                  )}
                  <span className="type-label">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {!isLoading && hasQuery && items.length === 0 ? (
          <p className="type-label mt-4 text-ink-muted">No results for “{query}”</p>
        ) : null}

        {hasQuery && items.length > 0 ? (
          <Link
            className="type-control focus-ring mt-8 inline-flex h-9 items-center underline underline-offset-4"
            href={getSearchResultUrl({ baseUrl: "/search", term: query.trim() })}
            onClick={(event) => {
              event.preventDefault();
              navigate(getSearchResultUrl({ baseUrl: "/search", term: query.trim() }));
            }}
          >
            View all results
          </Link>
        ) : null}

        {!hasQuery && items.length > 0 ? (
          <p className="type-body-sm mt-6 text-ink-muted">
            Search by product, collection or journal entry.
          </p>
        ) : null}
      </div>
    </SheetContent>
  );
}
