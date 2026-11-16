"use client";

import { getFilterRemovalUrl, serializeCollectionParams } from "@shopify/hydrogen";
import { useCollection, useCollectionActions } from "@shopify/hydrogen/react";

import { parseFilterInput } from "@/lib/collections";
import { formatPriceRangeLabel, getActiveFilterBadges } from "@/lib/filters";

import { usePublishedFacets } from "./collection-browse-provider";
import { FilterBadge } from "./filter-badge";

// Applied filters stay visible under the toolbar, so a zero-result view names what removed it.
export function CollectionActiveFilters() {
  const facets = usePublishedFacets();
  const state = useCollection();
  const actions = useCollectionActions();

  if (state.filters.length === 0) return null;

  const filters = facets?.filters ?? [];
  const badges = getActiveFilterBadges(filters, state.filters);
  const priceFilter = state.filters.find((filter) => filter.price)?.price;
  const params = serializeCollectionParams(state);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {badges.map((badge) => {
        const found = filters
          .find((filter) => filter.paramKey === badge.paramKey)
          ?.values.find((value) => value.value === badge.value);
        const filter = found ? parseFilterInput(found.input) : undefined;
        return (
          <FilterBadge
            href={filter ? getFilterRemovalUrl(params, filter) : undefined}
            key={`${badge.paramKey}-${badge.value}`}
            label={badge.label}
            onRemove={() => {
              if (filter) actions.toggleFilter(filter);
            }}
          />
        );
      })}
      {priceFilter ? (
        <FilterBadge
          href={getFilterRemovalUrl(params, { price: priceFilter })}
          label={formatPriceRangeLabel(
            priceFilter.min ?? null,
            priceFilter.max ?? null,
            facets?.priceRange?.currencyCode,
          )}
          onRemove={() => actions.setFilters(state.filters.filter((filter) => !filter.price))}
        />
      ) : null}
      <button
        className="type-label focus-ring inline-flex min-h-9 cursor-pointer items-center px-1 text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
        onClick={() => actions.reset()}
        type="button"
      >
        Clear all
      </button>
    </div>
  );
}
