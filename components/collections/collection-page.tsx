import { type ReactNode, Suspense } from "react";

import { CollectionViewedTracker } from "@/components/analytics/trackers";
import { BrowseResultsFallback } from "@/components/collections/browse";
import { CollectionBrowseFrame } from "@/components/collections/collection-browse-provider";
import { CollectionFiltersSkeleton } from "@/components/collections/filters";
import { PublishedCollectionFilters } from "@/components/collections/filters-client";
import { BrowseFallback, BrowseToolbar } from "@/components/collections/toolbar";
import { BreadcrumbSchema } from "@/components/schema/breadcrumb-schema";
import { CollectionSchema } from "@/components/schema/collection-schema";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { getCollections } from "@/lib/collections/server";
import type { Collection, SortValue } from "@/lib/collections/types";

interface CollectionLayoutProps {
  children: ReactNode;
  collection: Collection;
  handle: string;
  sortExclude?: SortValue[];
}

// The static and refine routes share this layout, so the header, toolbar, and filter sheet stay mounted when a filter switches between them.
export async function CollectionLayout({
  children,
  collection,
  handle,
  sortExclude,
}: CollectionLayoutProps) {
  const collections = await getCollections().catch(() => []);
  return (
    <>
      {collection.id ? (
        <CollectionViewedTracker collection={{ handle: collection.handle, id: collection.id }} />
      ) : null}
      <Page>
        <Container>
          <div className="grid min-w-0 gap-4">
            <CollectionHeader collection={collection} handle={handle} homeLabel="Home" />
            <CollectionBrowseFrame handle={handle} path={`/collections/${handle}`}>
              <div className="grid min-w-0 gap-4">
                <div className="flex min-w-0 flex-col gap-4 desktop:flex-row desktop:items-center desktop:gap-10">
                  <CollectionChips activeHandle={handle} collections={collections} />
                  <div className="min-w-0 desktop:ml-auto desktop:shrink-0">
                    <BrowseToolbar
                      filters={
                        <PublishedCollectionFilters fallback={<CollectionFiltersSkeleton />} />
                      }
                      sortExclude={sortExclude}
                    />
                  </div>
                </div>
                {children}
              </div>
            </CollectionBrowseFrame>
          </div>
        </Container>
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
    <Page aria-busy="true">
      <Container>
        <div className="grid gap-5 desktop:gap-6">
          <div className="grid gap-2.5">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <BrowseFallback />
        </div>
      </Container>
    </Page>
  );
}

function CollectionChips({
  activeHandle,
  collections,
}: {
  activeHandle: string;
  collections: Collection[];
}) {
  const chipHandles = new Set([
    "bottoms-women",
    "co-ord-sets",
    "corsets",
    "dresses-and-jumpsuits",
    "knits",
    "new-in",
    "tops",
  ]);
  const visible = collections.filter((collection) => chipHandles.has(collection.handle));
  return (
    <nav
      aria-label="Collections"
      className="scrollbar-hide -mx-(--gutter) flex w-full min-w-0 gap-5 overflow-x-auto px-(--gutter) desktop:mx-0 desktop:px-0"
    >
      <Link
        aria-current={activeHandle === "all" ? "page" : undefined}
        className="type-chip focus-ring flex min-h-9 min-w-9 shrink-0 items-center justify-center border-b border-transparent data-[active=true]:border-ink"
        data-active={activeHandle === "all"}
        href="/collections/all"
      >
        All products
      </Link>
      {visible.map((collection) => (
        <Link
          aria-current={collection.handle === activeHandle ? "page" : undefined}
          className="type-chip focus-ring flex min-h-9 min-w-9 shrink-0 items-center justify-center border-b border-transparent data-[active=true]:border-ink"
          data-active={collection.handle === activeHandle}
          href={`/collections/${collection.handle}`}
          key={collection.handle}
        >
          {collection.title}
        </Link>
      ))}
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
      <div>
        <h1 className="type-h2">
          <Link
            className="focus-ring inline-flex min-h-9 items-center"
            href={`/collections/${handle}`}
          >
            {title}
          </Link>
        </h1>
        {description && (
          <p className="type-body-sm mt-1.5 max-w-[60rem] text-ink-muted">{description}</p>
        )}
      </div>
    </>
  );
}
