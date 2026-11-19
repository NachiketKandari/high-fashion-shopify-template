import { cn } from "cn";
import { type ReactNode, Suspense } from "react";

import { CollectionViewedTracker } from "@/components/analytics/trackers";
import { CollectionActiveFilters } from "@/components/collections/active-filters";
import { BrowseResultsFallback } from "@/components/collections/browse";
import { BrowseGridSkeleton } from "@/components/collections/browse-grid";
import { CollectionBrowseFrame } from "@/components/collections/collection-browse-provider";
import { CollectionFiltersSkeleton } from "@/components/collections/filters";
import { PublishedCollectionFilters } from "@/components/collections/filters-client";
import { BrowseToolbar, BrowseToolbarFallback } from "@/components/collections/toolbar";
import { BreadcrumbSchema } from "@/components/schema/breadcrumb-schema";
import { CollectionSchema } from "@/components/schema/collection-schema";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { PRODUCTS_PER_PAGE } from "@/lib/collections";
import type { Collection, SortValue } from "@/lib/collections/types";
import { COLLECTION_TABS } from "@/lib/nav";

interface CollectionLayoutProps {
  children: ReactNode;
  collection: Collection;
  handle: string;
  sortExclude?: SortValue[];
}

// The static and refine routes share this layout, so the toolbar and filter sheet stay mounted when a filter switches between them.
export function CollectionLayout({
  children,
  collection,
  handle,
  sortExclude,
}: CollectionLayoutProps) {
  return (
    <>
      {collection.id ? (
        <CollectionViewedTracker collection={{ handle: collection.handle, id: collection.id }} />
      ) : null}
      <Page className="pt-6">
        <CollectionBrowseFrame handle={handle} path={`/collections/${handle}`}>
          <CollectionHeader collection={collection} handle={handle} homeLabel="Home" />
          <Container>
            <div className="grid gap-6">
              <CollectionTabs activeHandle={handle} />
              <div className="grid gap-2">
                <BrowseToolbar
                  filters={<PublishedCollectionFilters fallback={<CollectionFiltersSkeleton />} />}
                  sortExclude={sortExclude}
                />
                <CollectionActiveFilters />
              </div>
            </div>
          </Container>
          <div className="mt-4 desktop:mt-6">{children}</div>
        </CollectionBrowseFrame>
      </Page>
    </>
  );
}

interface CollectionBrowseBoundaryProps {
  children: ReactNode;
}

// Wraps every collection page's results; the first filter from the default view shows this grid skeleton while the refine route loads, and later changes keep the current grid.
export function CollectionBrowseBoundary({ children }: CollectionBrowseBoundaryProps) {
  return <Suspense fallback={<BrowseResultsFallback />}>{children}</Suspense>;
}

// The static default view otherwise renders from the client cache for any search string; reading search params makes the router ask the server, which proxy.ts rewrites to the refine route.
export function SearchParamsProbe({ searchParams }: { searchParams: Promise<unknown> }) {
  return (
    <Suspense fallback={null}>
      <SearchParamsRead searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchParamsRead({ searchParams }: { searchParams: Promise<unknown> }) {
  await searchParams;
  return null;
}

export function CollectionDetailSkeleton() {
  return (
    <Page aria-busy="true" className="pt-6">
      <Container>
        <div className="grid gap-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[56, 44, 38, 48, 42, 60, 66, 48, 82, 38, 42].map((width, index) => (
              <Skeleton className="h-5" key={index} style={{ width }} />
            ))}
          </div>
          <BrowseToolbarFallback />
        </div>
      </Container>
      <div className="mt-4 desktop:mt-6">
        <BrowseGridSkeleton count={PRODUCTS_PER_PAGE} />
      </div>
    </Page>
  );
}

function CollectionTabs({ activeHandle }: { activeHandle: string }) {
  return (
    <nav aria-label="Collections" className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {COLLECTION_TABS.map((tab) => {
        const active = tab.href === `/collections/${activeHandle}`;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-ring flex min-h-9 min-w-9 items-center justify-center",
              active ? "type-tab-active" : "type-caption",
            )}
            href={tab.href}
            key={tab.href}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

function CollectionHeader({
  collection,
  handle,
  homeLabel,
}: {
  collection: Collection;
  handle: string;
  homeLabel: string;
}) {
  const { title, description, updatedAt } = collection;

  const breadcrumbItems = [
    { name: homeLabel, path: "/" },
    { name: title, path: `/collections/${handle}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <CollectionSchema collection={{ handle, title, description, updatedAt }} />
      <h1 className="sr-only type-h2">{title}</h1>
    </>
  );
}
