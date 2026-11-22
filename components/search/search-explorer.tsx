"use client";

import { PredictiveSearchProvider } from "@shopify/hydrogen/react";
import { Search as SearchIcon, X as CloseIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, type KeyboardEvent, type ReactNode, useRef, useState } from "react";

import { Price } from "@/components/product/price";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import type { Image as ImageType } from "@/lib/media/types";
import type { Money } from "@/lib/money/types";
import { SEARCH_TERM_MAX_LENGTH, TRENDING_SEARCH_TERMS } from "@/lib/search";
import { usePredictiveSearch } from "@/lib/search/client";

const SUGGESTION_ROW_CLASS = "type-h3 focus-ring flex w-full cursor-pointer items-center text-left";
const SUGGESTIONS_CLASS = "mt-6 grid grid-cols-1 gap-4 pl-8";

interface SearchExplorerProps {
  autoFocus?: boolean;
  children?: ReactNode;
  initialQuery?: string;
  inputId?: string;
  onClose?: () => void;
}

export function SearchExplorer(props: SearchExplorerProps) {
  return (
    <PredictiveSearchProvider
      debounceInMs={250}
      limit={4}
      types={["COLLECTION", "PRODUCT", "QUERY"]}
    >
      <SearchExplorerContent {...props} />
    </PredictiveSearchProvider>
  );
}

type SuggestionOption =
  | { href: string; key: string; kind: "collection"; title: string }
  | {
      featuredImage: ImageType | null;
      href: string;
      key: string;
      kind: "product";
      price: Money;
      title: string;
    }
  | { key: string; kind: "see-all"; term: string }
  | { key: string; kind: "search"; styledText?: string; term: string };

type MatchPart = { matched: boolean; text: string };

function SearchExplorerContent({
  autoFocus = false,
  children,
  initialQuery = "",
  inputId = "search-input",
  onClose,
}: SearchExplorerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialQuery);
  const { activeIndex, error, isLoading, reset, results, setActiveIndex, setQuery } =
    usePredictiveSearch();
  const term = value.trim();
  const isTyping = term.length > 0 && term !== initialQuery;
  const typedResults = isTyping && results ? results : null;
  const suggestions = typedResults
    ? [...typedResults.queries, ...typedResults.collections, ...typedResults.products]
    : [];
  const queryOptions: SuggestionOption[] = typedResults
    ? typedResults.queries.map((suggestion) => ({
        key: `query-${suggestion.text}`,
        kind: "search",
        styledText: suggestion.styledText,
        term: suggestion.text,
      }))
    : [];
  const collectionOptions: SuggestionOption[] = typedResults
    ? typedResults.collections.map((collection) => ({
        href: collection.href,
        key: `collection-${collection.id}`,
        kind: "collection",
        title: collection.title,
      }))
    : [];
  const productOptions: SuggestionOption[] = typedResults
    ? typedResults.products.map((product) => ({
        featuredImage: product.featuredImage,
        href: product.href,
        key: `product-${product.id}`,
        kind: "product",
        price: product.price,
        title: product.title,
      }))
    : [];
  const options: SuggestionOption[] = suggestions.length
    ? [
        { key: "term", kind: "search", term },
        ...queryOptions,
        ...collectionOptions,
        ...productOptions,
        { key: "see-all", kind: "see-all", term },
      ]
    : [];
  const statusNote = error
    ? "Suggestions are unavailable right now."
    : isLoading
      ? "Searching…"
      : `No suggestions for ‘${term}’.`;
  const announcement = error
    ? "Search suggestions are unavailable."
    : suggestions.length
      ? `${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"} available.`
      : isLoading
        ? "Searching."
        : `No suggestions for ‘${term}’.`;

  function navigate(next: string) {
    const nextTerm = next.trim();
    if (!nextTerm) return;
    if (nextTerm === initialQuery) {
      inputRef.current?.focus();
      return;
    }
    router.push(`/search?q=${encodeURIComponent(nextTerm)}`);
  }

  function select(option: SuggestionOption) {
    if (option.kind === "search" || option.kind === "see-all") navigate(option.term);
    else router.push(option.href);
  }

  function handleChange(next: string) {
    setValue(next);
    if (next.trim()) setQuery(next);
    else reset();
  }

  function clear() {
    setValue("");
    reset();
    if (initialQuery) {
      router.push("/search");
      return;
    }
    inputRef.current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(term);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (options.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, options.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, -1));
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) select(option);
    }
  }

  return (
    <div>
      <form
        action="/search"
        className="grid gap-3 tablet:grid-cols-[1fr_276px] tablet:gap-10"
        method="get"
        onSubmit={handleSubmit}
        role="search"
      >
        <div className="flex h-[57px] items-center gap-2 border-b border-ink pr-4 focus-within:border-b-2">
          <SearchIcon
            aria-hidden="true"
            className="size-6 shrink-0 text-ink-muted"
            strokeWidth={1.5}
          />
          <input
            aria-activedescendant={
              activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined
            }
            aria-autocomplete="list"
            aria-controls={options.length > 0 ? `${inputId}-suggestions` : undefined}
            aria-expanded={isTyping}
            autoComplete="off"
            autoFocus={autoFocus}
            className="type-h3 h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-ink outline-none placeholder:text-ink-muted"
            id={inputId}
            maxLength={SEARCH_TERM_MAX_LENGTH}
            name="q"
            onChange={(event) => handleChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search"
            ref={inputRef}
            role="combobox"
            type="text"
            value={value}
          />
          {value || onClose ? (
            <button
              aria-label={value ? "Clear search" : "Close search"}
              className="focus-ring flex size-9 shrink-0 cursor-pointer items-center justify-center text-ink"
              onClick={value ? clear : onClose}
              type="button"
            >
              <CloseIcon className="size-5" strokeWidth={1.25} />
            </button>
          ) : null}
        </div>
        <button
          className="type-nav flex h-[57px] w-full cursor-pointer items-center justify-center rounded-control bg-ink-strong text-inverse uppercase tablet:max-w-[276px] tablet:justify-self-end"
          type="submit"
        >
          Search
        </button>
      </form>

      {isTyping ? (
        <>
          {options.length > 0 ? (
            <ul
              aria-busy={isLoading || undefined}
              aria-label="Search suggestions"
              className={SUGGESTIONS_CLASS}
              id={`${inputId}-suggestions`}
              role="listbox"
            >
              {options.map((option, index) => (
                <li key={option.key} role="presentation">
                  <SuggestionOptionRow
                    active={activeIndex === index}
                    id={`${inputId}-option-${index}`}
                    onActivate={() => setActiveIndex(index)}
                    onSelect={() => select(option)}
                    option={option}
                    term={term}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className={SUGGESTIONS_CLASS}>
              <p className="type-h3 text-ink-muted">{statusNote}</p>
              <SeeAllResults onNavigate={() => navigate(term)} term={term} />
            </div>
          )}
          <p className="sr-only" role="status">
            {announcement}
          </p>
        </>
      ) : term === "" ? (
        <div className="mt-10 pl-8">
          <p className="type-h3 text-ink-muted">Trending search -</p>
          <ul className="mt-6 grid gap-4" role="list">
            {TRENDING_SEARCH_TERMS.map((trending) => (
              <li key={trending}>
                <Link
                  className="type-h3 focus-ring flex text-ink"
                  href={`/search?q=${encodeURIComponent(trending)}`}
                >
                  {trending}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : children ? (
        <div className="mt-10">{children}</div>
      ) : null}
    </div>
  );
}

interface SuggestionOptionRowProps {
  active: boolean;
  id: string;
  onActivate: () => void;
  onSelect: () => void;
  option: SuggestionOption;
  term: string;
}

function SuggestionOptionRow({
  active,
  id,
  onActivate,
  onSelect,
  option,
  term,
}: SuggestionOptionRowProps) {
  if (option.kind === "product") {
    return (
      <button
        aria-selected={active}
        className="type-h3 focus-ring flex w-full cursor-pointer items-center gap-4 py-2 text-left"
        id={id}
        onClick={onSelect}
        onMouseEnter={onActivate}
        role="option"
        tabIndex={-1}
        type="button"
      >
        <span className="relative size-10 shrink-0 overflow-hidden bg-surface">
          {option.featuredImage ? (
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="100vw"
              src={option.featuredImage.url}
            />
          ) : (
            <ImagePlaceholder className="size-full" />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate">
          <Highlight parts={buildTermParts(option.title, term)} />
        </span>
        <Price
          amount={option.price.amount}
          className="shrink-0 text-ink-muted"
          currencyCode={option.price.currencyCode}
        />
      </button>
    );
  }
  if (option.kind === "collection") {
    return (
      <button
        aria-selected={active}
        className={SUGGESTION_ROW_CLASS}
        id={id}
        onClick={onSelect}
        onMouseEnter={onActivate}
        role="option"
        tabIndex={-1}
        type="button"
      >
        <span className="min-w-0 truncate">
          <Highlight parts={buildTermParts(option.title, term)} />
        </span>
        <span className="shrink-0 pl-2 text-ink-muted">- Collection</span>
      </button>
    );
  }
  if (option.kind === "see-all") {
    return (
      <button
        aria-selected={active}
        className={`${SUGGESTION_ROW_CLASS} text-ink-muted`}
        id={id}
        onClick={onSelect}
        onMouseEnter={onActivate}
        role="option"
        tabIndex={-1}
        type="button"
      >
        <SeeAllLabel term={term} />
      </button>
    );
  }
  return (
    <button
      aria-selected={active}
      className={SUGGESTION_ROW_CLASS}
      id={id}
      onClick={onSelect}
      onMouseEnter={onActivate}
      role="option"
      tabIndex={-1}
      type="button"
    >
      {option.styledText === undefined ? (
        <span>{option.term}</span>
      ) : (
        <Highlight parts={parseStyledSuggestion(option.styledText)} />
      )}
    </button>
  );
}

function SeeAllLabel({ term }: { term: string }) {
  return <Highlight parts={buildTermParts(`see all results for ‘${term}’`, term)} />;
}

function SeeAllResults({ onNavigate, term }: { onNavigate: () => void; term: string }) {
  return (
    <button className={`${SUGGESTION_ROW_CLASS} text-ink-muted`} onClick={onNavigate} type="button">
      <SeeAllLabel term={term} />
    </button>
  );
}

function Highlight({ fallback, parts }: { fallback?: string; parts: MatchPart[] }) {
  if (parts.length === 0) {
    return fallback ? <span className="text-ink-muted">{fallback}</span> : null;
  }
  return (
    <>
      {parts.map((part, index) => (
        <span
          className={part.matched ? "text-ink" : "text-ink-muted"}
          key={`${index}-${part.text}`}
        >
          {part.text}
        </span>
      ))}
    </>
  );
}

function parseStyledSuggestion(styledText: string): MatchPart[] {
  const parts: MatchPart[] = [];
  let matched = false;
  for (const segment of styledText.split(/(<b>|<\/b>)/i)) {
    if (/^<b>$/i.test(segment)) {
      matched = true;
      continue;
    }
    if (/^<\/b>$/i.test(segment)) {
      matched = false;
      continue;
    }
    if (segment) parts.push({ matched, text: segment });
  }
  return parts;
}

function buildTermParts(text: string, term: string): MatchPart[] {
  if (!term) return [{ matched: false, text }];
  const haystack = text.toLowerCase();
  const needle = term.toLowerCase();
  const parts: MatchPart[] = [];
  let cursor = 0;
  for (
    let index = haystack.indexOf(needle);
    index !== -1;
    index = haystack.indexOf(needle, cursor)
  ) {
    if (index > cursor) parts.push({ matched: false, text: text.slice(cursor, index) });
    parts.push({ matched: true, text: text.slice(index, index + needle.length) });
    cursor = index + needle.length;
  }
  if (cursor < text.length) parts.push({ matched: false, text: text.slice(cursor) });
  return parts;
}
