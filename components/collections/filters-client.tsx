"use client";

import {
  type CollectionState,
  filterEquals,
  getFilterRemovalUrl,
  isFilterInputActive,
  serializeCollectionParams,
} from "@shopify/hydrogen";
import { useCollection, useCollectionActions } from "@shopify/hydrogen/react";
import { CheckIcon, LoaderCircleIcon, XIcon } from "lucide-react";
import {
  type KeyboardEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  useState,
} from "react";

import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Swatch } from "@/components/ui/swatch";
import { parseFilterInput } from "@/lib/collections";
import { shopConfig } from "@/lib/config";
import { getActiveFilterBadges } from "@/lib/filters";
import type { Filter, PriceRange } from "@/lib/filters/types";
import { formatCurrencySymbol, formatPrice } from "@/lib/money";
import { getColorSwatch } from "@/lib/product/color-swatches";

import { usePublishedFacets } from "./collection-browse-provider";

interface FilterSheetProps {
  children: ReactNode;
  label: string;
  trigger: ReactElement;
}

export function FilterSheet({ children, label, trigger }: FilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger render={trigger} />
      <SheetContent
        className="w-(--drawer-filter) max-w-full gap-0 border-l border-rule p-0"
        side="right"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-14 shrink-0 items-center border-b border-rule pr-12 pl-(--gutter)">
            <SheetTitle>{label}</SheetTitle>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-(--gutter)">{children}</div>
          <FilterFooter />
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface PublishedCollectionFiltersProps {
  fallback: ReactNode;
}

// The collection layout's filter sheet shows the facets of the last results a page rendered, so it keeps them while the next view loads.
export function PublishedCollectionFilters({ fallback }: PublishedCollectionFiltersProps) {
  const facets = usePublishedFacets();
  if (!facets) return fallback;
  return <CollectionFilterSidebar filters={facets.filters} priceRange={facets.priceRange} />;
}

interface CollectionFilterSidebarProps {
  filters: Filter[];
  priceRange?: PriceRange;
}

export function CollectionFilterSidebar({ filters, priceRange }: CollectionFilterSidebarProps) {
  const state = useCollection();
  const actions = useCollectionActions();
  const priceFilter = state.filters.find((filter) => filter.price)?.price;
  const priceMin = priceFilter?.min ?? null;
  const priceMax = priceFilter?.max ?? null;
  const priceKey = `${priceMin ?? ""}:${priceMax ?? ""}`;
  const [priceInputs, setPriceInputs] = useState({
    key: priceKey,
    max: priceMax?.toString() ?? "",
    min: priceMin?.toString() ?? "",
  });
  // Applied price changed (URL/back-forward), so discard unsubmitted input.
  if (priceInputs.key !== priceKey) {
    setPriceInputs({
      key: priceKey,
      max: priceMax?.toString() ?? "",
      min: priceMin?.toString() ?? "",
    });
  }
  const minInput = priceInputs.key === priceKey ? priceInputs.min : (priceMin?.toString() ?? "");
  const maxInput = priceInputs.key === priceKey ? priceInputs.max : (priceMax?.toString() ?? "");
  const currentParams = serializeCollectionParams(state);
  const isPending = state.status === "loading";
  const activeBadges = getActiveFilterBadges(filters, state.filters);
  const applyPrice = (min: number | null, max: number | null) => {
    const next = state.filters.filter((filter) => !filter.price);
    if (min !== null || max !== null) {
      next.push({
        price: {
          ...(max !== null ? { max } : {}),
          ...(min !== null ? { min } : {}),
        },
      });
    }
    actions.setFilters(next);
  };
  return (
    <div className="flex flex-col gap-5">
      {activeBadges.length > 0 || priceFilter ? (
        <div className="flex flex-wrap gap-1.5">
          {activeBadges.map((badge) => {
            const filter = parseFilterInput(
              findFilterInput(filters, badge.paramKey, badge.value) ?? "",
            );
            return (
              <FilterBadge
                key={`${badge.paramKey}-${badge.value}`}
                href={filter ? getFilterRemovalUrl(currentParams, filter) : undefined}
                label={badge.label}
                onRemove={() => filter && actions.toggleFilter(filter)}
              />
            );
          })}
          {priceFilter ? (
            <FilterBadge
              href={getFilterRemovalUrl(currentParams, { price: priceFilter })}
              label={formatPriceRangeLabel(priceMin, priceMax, priceRange?.currencyCode)}
              onRemove={() => applyPrice(null, null)}
            />
          ) : null}
        </div>
      ) : null}

      {priceRange ? (
        <FilterSection title="Price">
          <div className="flex items-center gap-2">
            <PriceInput
              currencyCode={priceRange.currencyCode}
              label="Minimum price"
              onChange={(min) => setPriceInputs((prev) => ({ ...prev, min }))}
              placeholder="From"
              value={minInput}
            />
            <span className="text-muted-foreground">–</span>
            <PriceInput
              currencyCode={priceRange.currencyCode}
              label="Maximum price"
              onChange={(max) => setPriceInputs((prev) => ({ ...prev, max }))}
              placeholder="To"
              value={maxInput}
            />
            <button
              aria-label="Apply price"
              className="focus-ring flex size-9 cursor-pointer items-center justify-center bg-ink text-inverse transition-opacity hover:opacity-80"
              onClick={() => applyPrice(parsePriceValue(minInput), parsePriceValue(maxInput))}
              type="button"
            >
              <CheckIcon className="size-4" />
            </button>
          </div>
        </FilterSection>
      ) : null}

      {filters.map((filter) =>
        filter.values.length === 0 ? null : (
          <FilterSection key={filter.id} title={filter.label}>
            {filter.presentation === "swatch" ? (
              <div className="flex flex-wrap gap-2">
                {filter.values.map((value) => {
                  const isSelected = isFilterInputActive(state.filters, value.input);
                  return (
                    <Link
                      key={value.id}
                      aria-label={`Filter by ${filter.label}: ${value.label}`}
                      aria-pressed={isSelected}
                      className="block cursor-pointer"
                      href={buildToggleHref(state, value.input)}
                      onKeyDown={pressOnSpace}
                      role="button"
                      scroll={false}
                      onClick={(event) => {
                        event.preventDefault();
                        actions.toggleFilterInput(value.input);
                      }}
                    >
                      <Swatch
                        color={value.swatch?.color ?? getColorSwatch(value.label)}
                        image={value.swatch?.image}
                        label={value.label}
                        selected={isSelected}
                      />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col">
                {filter.values.map((value) => {
                  const isSelected = isFilterInputActive(state.filters, value.input);
                  return (
                    <FilterOption
                      key={value.id}
                      count={value.count}
                      href={buildToggleHref(state, value.input)}
                      label={value.label}
                      pending={isPending && isSelected}
                      selected={isSelected}
                      onClick={(event) => {
                        event.preventDefault();
                        actions.toggleFilterInput(value.input);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </FilterSection>
        ),
      )}
    </div>
  );
}

function FilterFooter() {
  const actions = useCollectionActions();
  return (
    <div className="flex shrink-0 items-center gap-3 border-t border-rule px-(--gutter) py-4">
      <button
        className="type-control focus-ring flex h-9 items-center underline underline-offset-4"
        onClick={() => actions.setFilters([])}
        type="button"
      >
        Clear all
      </button>
      <SheetClose
        render={
          <button
            className="type-control focus-ring ml-auto flex h-9 items-center bg-ink px-5 text-inverse"
            type="button"
          >
            Apply
          </button>
        }
      />
    </div>
  );
}

interface FilterSectionProps {
  children: ReactNode;
  title: string;
}

function FilterSection({ children, title }: FilterSectionProps) {
  return (
    <details className="group border-t border-rule py-4" open>
      <summary className="type-h4 flex min-h-9 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden="true"
          className="text-base leading-none font-light transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

interface FilterBadgeProps {
  href?: string;
  label: string;
  onRemove: () => void;
}

function FilterBadge({ href, label, onRemove }: FilterBadgeProps) {
  const className =
    "type-label focus-ring inline-flex min-h-9 cursor-pointer items-center gap-1 bg-surface px-2.5 text-ink transition-colors hover:bg-rule";
  const content = (
    <>
      {label}
      <XIcon className="size-3" strokeWidth={1.25} />
    </>
  );
  const removeLabel = `Remove filter: ${label}`;
  if (!href) {
    return (
      <button aria-label={removeLabel} className={className} onClick={onRemove} type="button">
        {content}
      </button>
    );
  }
  return (
    <Link
      aria-label={removeLabel}
      className={className}
      href={href}
      scroll={false}
      onClick={(event) => {
        event.preventDefault();
        onRemove();
      }}
    >
      {content}
    </Link>
  );
}

interface FilterOptionProps {
  count?: number;
  href: string;
  label: string;
  onClick: MouseEventHandler<HTMLAnchorElement>;
  pending: boolean;
  selected: boolean;
}

function FilterOption({ count, href, label, onClick, pending, selected }: FilterOptionProps) {
  return (
    <Link
      aria-pressed={selected}
      href={href}
      onKeyDown={pressOnSpace}
      role="button"
      data-selected={selected}
      className="type-body-sm flex min-h-9 items-center gap-3 text-left transition-opacity hover:opacity-60 data-[selected=true]:font-normal"
      onClick={onClick}
    >
      <span
        aria-hidden="true"
        className="flex size-3 shrink-0 items-center justify-center border border-foreground"
      >
        {selected ? <span className="size-1.5 bg-foreground" /> : null}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="type-label text-ink-muted">{count}</span>}
      {pending ? (
        <LoaderCircleIcon className="size-3.5 animate-spin text-muted-foreground" />
      ) : null}
    </Link>
  );
}

interface PriceInputProps {
  currencyCode?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

function PriceInput({ currencyCode, label, onChange, placeholder, value }: PriceInputProps) {
  return (
    <div className="flex h-9 flex-1 items-center border-b border-rule">
      <span className="text-xs text-muted-foreground">
        {currencyCode ? formatCurrencySymbol(currencyCode) : null}
      </span>
      <Input
        aria-label={label}
        type="number"
        step="0.01"
        min="0"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 border-0 bg-transparent px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}

// Filter links toggle in place, so they take the button role that `aria-pressed` needs, and buttons answer Space.
function pressOnSpace(event: KeyboardEvent<HTMLAnchorElement>) {
  if (event.key !== " ") return;
  event.preventDefault();
  event.currentTarget.click();
}

function buildToggleHref(
  state: Pick<CollectionState, "filters" | "reverse" | "sortKey">,
  input: string,
): string {
  const filter = parseFilterInput(input);
  if (!filter) return "?";
  const params = serializeCollectionParams(state);
  if (state.filters.some((current) => filterEquals(current, filter))) {
    return getFilterRemovalUrl(params, filter);
  }
  const next = serializeCollectionParams({ ...state, filters: [...state.filters, filter] });
  const query = next.toString();
  return query ? `?${query}` : "?";
}

function findFilterInput(filters: Filter[], key: string, value: string): string | undefined {
  return filters
    .find((filter) => filter.paramKey === key)
    ?.values.find((item) => item.value === value)?.input;
}

function formatPriceRangeLabel(
  min: number | null,
  max: number | null,
  currencyCode: string | undefined,
): string {
  const format = (value: number) =>
    currencyCode
      ? formatPrice({ amount: String(value), currencyCode })
      : new Intl.NumberFormat(shopConfig.localization.locale).format(value);
  if (min !== null && max !== null) return `${format(min)} - ${format(max)}`;
  if (min !== null) return `From ${format(min)}`;
  return `Up to ${format(max ?? 0)}`;
}

function parsePriceValue(value: string): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) || parsed < 0 ? null : parsed;
}
