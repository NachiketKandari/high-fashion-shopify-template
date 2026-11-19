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
    <div className="grid justify-items-center gap-5 px-(--gutter) py-20 text-center">
      <p className="type-body">
        {hasFilters
          ? "No clothing matching your filters"
          : query
            ? `No clothing matching “${query}”`
            : "No clothing available yet"}
      </p>
      {hasFilters ? (
        <Button onClick={() => actions.reset()} type="button">
          Reset filter
        </Button>
      ) : browseAllHref ? (
        <Button render={<Link href={browseAllHref} />}>Browse all products</Button>
      ) : null}
    </div>
  );
}
