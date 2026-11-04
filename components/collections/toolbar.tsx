import { ChevronDownIcon, Grid2X2Icon, LayoutGridIcon, SlidersHorizontalIcon } from "lucide-react";
import type { ReactNode } from "react";

import { ProductsGridSkeleton } from "@/components/product/products-grid";
import { PRODUCTS_PER_PAGE } from "@/lib/collections";
import type { SortValue } from "@/lib/collections/types";

import { CollectionActiveFilterCountBadge } from "./collection-browse-provider";
import { FilterSheet } from "./filters-client";
import { CollectionsSortSelect } from "./sort-select";

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
            <button
              className="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-wider"
              type="button"
            >
              <SlidersHorizontalIcon className="size-3.5" strokeWidth={1.25} />
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
          <button
            className="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-wider"
            type="button"
          >
            <SlidersHorizontalIcon className="size-3.5" strokeWidth={1.25} />
            <span>Filter</span>
          </button>
        }
        resultCount={resultCount}
        sortSelect={
          <div className="flex h-5 w-fit items-center gap-2 text-xs uppercase tracking-wider">
            <span>Featured</span>
            <ChevronDownIcon className="size-3.5 text-muted-foreground" strokeWidth={1.25} />
          </div>
        }
      />
      <ProductsGridSkeleton
        count={PRODUCTS_PER_PAGE}
        className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      />
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
    <div className="flex items-center gap-5">
      <div className="order-2 hidden items-center gap-2 md:order-1 md:flex">
        <button
          aria-label="Grid view"
          aria-pressed="true"
          className="flex size-5 items-center justify-center"
          type="button"
        >
          <LayoutGridIcon className="size-4" strokeWidth={1.25} />
        </button>
        <button
          aria-label="Large grid view"
          aria-pressed="false"
          className="flex size-5 items-center justify-center text-muted-foreground"
          type="button"
        >
          <Grid2X2Icon className="size-4" strokeWidth={1.25} />
        </button>
      </div>
      <div className="order-1 md:order-2 md:ml-auto">{filterSheet}</div>
      {resultCount !== undefined && (
        <div className="order-2 hidden items-center text-xs text-muted-foreground sm:flex">
          {resultCount}
        </div>
      )}
      <div className="order-3 ml-auto md:ml-0">{sortSelect}</div>
    </div>
  );
}
