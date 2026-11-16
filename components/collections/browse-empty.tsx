"use client";

import { useCollection, useCollectionActions } from "@shopify/hydrogen/react";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

interface BrowseEmptyProps {
  browseAllHref?: string;
  query?: string;
}

export function BrowseEmpty({ browseAllHref, query }: BrowseEmptyProps) {
  const hasFilters = useCollection((state) => state.filters.length > 0);
  const actions = useCollectionActions();

  return (
    <div className="grid justify-items-center gap-4 py-20 text-center">
      <h2 className="type-h2">No products found</h2>
      <p className="type-body-sm max-w-100 text-ink-muted">
        {hasFilters
          ? "Nothing matches these filters. Remove one to see more."
          : query
            ? `No products match "${query}".`
            : "This collection has no products available yet."}
      </p>
      {hasFilters ? (
        <Button onClick={() => actions.reset()} type="button" variant="outline">
          Clear filters
        </Button>
      ) : browseAllHref ? (
        <Button render={<Link href={browseAllHref} />} variant="outline">
          Browse all products
        </Button>
      ) : null}
    </div>
  );
}
