import type { ReactNode } from "react";

import { ProductsGridSkeleton } from "@/components/product/products-grid";
import { PRODUCTS_PER_PAGE } from "@/lib/collections";
import type { SortValue } from "@/lib/collections/types";

import { CollectionActiveFilterCountBadge } from "./collection-browse-provider";
import { FilterSheet } from "./filters-client";
import { CollectionsSortSelect } from "./sort-select";

const FILTER_TRIGGER_CLASS =
  "type-chip focus-ring flex h-9 cursor-pointer items-center gap-2 bg-transparent";

interface BrowseToolbarProps {
  filters: ReactNode;
  resultCount?: ReactNode;
  sortExclude?: SortValue[];
}

export function BrowseToolbar({ filters, resultCount, sortExclude }: BrowseToolbarProps) {
  return (
    <ToolbarLayout
      filterSheet={
        <FilterSheet
          label="Filter"
          trigger={
            <button className={FILTER_TRIGGER_CLASS} type="button">
              <span>Filter</span>
              <CollectionActiveFilterCountBadge />
            </button>
          }
        >
          {filters}
        </FilterSheet>
      }
      resultCount={resultCount}
      sortSelect={<CollectionsSortSelect exclude={sortExclude} />}
    />
  );
}

interface BrowseFallbackProps {
  resultCount?: ReactNode;
}

export function BrowseFallback({ resultCount }: BrowseFallbackProps) {
  return (
    <>
      <ToolbarLayout
        filterSheet={
          <button className={FILTER_TRIGGER_CLASS} type="button">
            <span>Filter</span>
          </button>
        }
        resultCount={resultCount}
        sortSelect={<span className="type-chip flex h-9 items-center">Featured</span>}
      />
      <ProductsGridSkeleton count={PRODUCTS_PER_PAGE} />
    </>
  );
}

interface ToolbarLayoutProps {
  filterSheet: ReactNode;
  resultCount?: ReactNode;
  sortSelect: ReactNode;
}

function ToolbarLayout({ filterSheet, resultCount, sortSelect }: ToolbarLayoutProps) {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <div className="shrink-0">{filterSheet}</div>
      {resultCount !== undefined && (
        <div className="type-body-sm hidden min-w-0 items-center truncate text-ink-muted tablet:flex">
          {resultCount}
        </div>
      )}
      <div className="ml-auto shrink-0">{sortSelect}</div>
    </div>
  );
}
