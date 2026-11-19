"use client";

import { getSortByValue } from "@shopify/hydrogen";
import { useCollection, useCollectionActions } from "@shopify/hydrogen/react";

import { SORT_LABELS, SORT_VALUES } from "@/lib/collections";
import type { SortValue } from "@/lib/collections/types";

export function CollectionsSortOptions({ exclude = [] }: { exclude?: SortValue[] }) {
  const { reverse, sortKey, status } = useCollection();
  const { setSortByValue } = useCollectionActions();
  const current = sortKey ? getSortByValue(sortKey, reverse) : "manual";
  const options = SORT_VALUES.filter((value) => !exclude.includes(value));

  return (
    <div className="flex flex-col">
      {options.map((value) => {
        const selected = current === value;
        return (
          <button
            aria-pressed={selected}
            className="type-body-sm flex min-h-9 cursor-pointer items-center gap-3 text-left text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 data-[selected=true]:text-ink"
            data-selected={selected}
            disabled={status === "loading"}
            key={value}
            onClick={() => setSortByValue(value)}
            type="button"
          >
            <span
              aria-hidden="true"
              className="flex size-3 shrink-0 items-center justify-center border border-ink"
            >
              {selected ? <span className="size-1.5 bg-ink" /> : null}
            </span>
            <span className="flex-1">{SORT_LABELS[value]}</span>
          </button>
        );
      })}
    </div>
  );
}
