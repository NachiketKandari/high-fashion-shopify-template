"use client";

import { PredictiveSearchProvider } from "@shopify/hydrogen/react";
import { Search as SearchIcon, X as CloseIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, type KeyboardEvent, type ReactNode, useRef, useState } from "react";

import { Link } from "@/components/ui/link";
import { SEARCH_TERM_MAX_LENGTH, TRENDING_SEARCH_TERMS } from "@/lib/search";
import { usePredictiveSearch } from "@/lib/search/client";
import type { SearchSuggestion } from "@/lib/search/types";

interface SearchExplorerProps {
  autoFocus?: boolean;
  children?: ReactNode;
  closeOnNavigate?: boolean;
  initialQuery?: string;
  inputId?: string;
  onClose?: () => void;
}

export function SearchExplorer(props: SearchExplorerProps) {
  return (
    <PredictiveSearchProvider debounceInMs={250} limit={4} types={["QUERY"]}>
      <SearchExplorerContent {...props} />
    </PredictiveSearchProvider>
  );
}

function SearchExplorerContent({
  autoFocus = false,
  children,
  closeOnNavigate = false,
  initialQuery = "",
  inputId = "search-input",
  onClose,
}: SearchExplorerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialQuery);
  const { activeIndex, reset, results, setActiveIndex, setQuery } = usePredictiveSearch();
  const term = value.trim();
  const isTyping = term.length > 0 && term !== initialQuery;
  const suggestions = isTyping ? (results?.queries ?? []) : [];
  const items = isTyping ? [...suggestions.map((suggestion) => suggestion.text), term] : [];

  function navigate(next: string) {
    const nextTerm = next.trim();
    if (!nextTerm) return;
    if (closeOnNavigate) onClose?.();
    if (nextTerm === initialQuery) {
      inputRef.current?.focus();
      return;
    }
    router.push(`/search?q=${encodeURIComponent(nextTerm)}`);
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
      if (closeOnNavigate) onClose?.();
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
    if (!isTyping) return;
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
      event.preventDefault();
      const item = items[activeIndex];
      if (item) navigate(item);
    }
  }

  return (
    <div>
      <form
        action="/search"
        className="grid gap-3 desktop:grid-cols-[1fr_276px] desktop:gap-10"
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
            aria-controls={isTyping ? `${inputId}-suggestions` : undefined}
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
              className="focus-ring flex size-9 shrink-0 items-center justify-center text-ink"
              onClick={value ? clear : onClose}
              type="button"
            >
              <CloseIcon className="size-5" strokeWidth={1.25} />
            </button>
          ) : null}
        </div>
        <button
          className="type-nav flex h-[57px] items-center justify-center rounded-control bg-ink-strong text-inverse uppercase"
          type="submit"
        >
          Search
        </button>
      </form>

      {isTyping ? (
        <ul
          aria-label="Search suggestions"
          className="mt-6 grid gap-4 pl-8"
          id={`${inputId}-suggestions`}
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.text} role="presentation">
              <button
                aria-selected={activeIndex === index}
                className="type-h3 focus-ring flex w-full items-center text-left"
                id={`${inputId}-option-${index}`}
                onClick={() => navigate(suggestion.text)}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                tabIndex={-1}
                type="button"
              >
                <SuggestionLabel suggestion={suggestion} />
              </button>
            </li>
          ))}
          <li role="presentation">
            <button
              aria-selected={activeIndex === suggestions.length}
              className="type-h3 focus-ring flex w-full items-center text-left text-ink-muted"
              id={`${inputId}-option-${suggestions.length}`}
              onClick={() => navigate(term)}
              onMouseEnter={() => setActiveIndex(suggestions.length)}
              role="option"
              tabIndex={-1}
              type="button"
            >
              see all results for ‘{term}’
            </button>
          </li>
        </ul>
      ) : term === "" ? (
        <div className="mt-10 pl-8">
          <p className="type-h3 text-ink-muted">Trending search -</p>
          <ul className="mt-6 grid gap-4" role="list">
            {TRENDING_SEARCH_TERMS.map((trending) => (
              <li key={trending}>
                <Link
                  className="type-h3 focus-ring flex text-ink"
                  href={`/search?q=${encodeURIComponent(trending)}`}
                  onClick={closeOnNavigate ? onClose : undefined}
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

function parseStyledSuggestion(styledText: string) {
  const parts: Array<{ matched: boolean; text: string }> = [];
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

function SuggestionLabel({ suggestion }: { suggestion: SearchSuggestion }) {
  const parts = parseStyledSuggestion(suggestion.styledText);

  if (parts.length === 0) {
    return <span className="text-ink-muted">{suggestion.text}</span>;
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
