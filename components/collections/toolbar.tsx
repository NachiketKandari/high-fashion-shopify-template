import type { ReactNode } from "react";

import type { SortValue } from "@/lib/collections/types";

import { CardDensityToggle } from "./card-density-toggle";
import { CardViewToggle } from "./card-view-toggle";
import { CollectionActiveFilterCountBadge } from "./collection-browse-provider";
import { FilterSheet } from "./filters-client";
import { CollectionsSortOptions } from "./sort-options";

const FILTER_TRIGGER_CLASS =
  "type-caption focus-ring flex h-9 min-w-9 cursor-pointer items-center justify-center gap-2 bg-transparent";

interface BrowseToolbarProps {
  filters: ReactNode;
  sortExclude?: SortValue[];
}

export function BrowseToolbar({ filters, sortExclude }: BrowseToolbarProps) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-6">
        <CardDensityToggle />
        <CardViewToggle />
      </div>
      <FilterSheet
        label="Filter"
        trigger={
          <button className={FILTER_TRIGGER_CLASS} data-slot="filter-trigger" type="button">
            <span>Filter</span>
            <CollectionActiveFilterCountBadge />
          </button>
        }
      >
        <div className="grid gap-2 py-4">
          <p className="type-h4">Sort</p>
          <CollectionsSortOptions exclude={sortExclude} />
        </div>
        {filters}
      </FilterSheet>
    </div>
  );
}

export function BrowseToolbarFallback() {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-6">
        <CardDensityToggle />
        <CardViewToggle />
      </div>
      <span className="type-caption flex h-9 items-center">Filter</span>
    </div>
  );
}
