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
      <Page className="pt-6 md:pt-8">
        <Container>
          <div className="grid gap-4">
            <CollectionHeader collection={collection} handle={handle} homeLabel="Home" />
            <CollectionBrowseFrame handle={handle} path={`/collections/${handle}`}>
              <div className="grid gap-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-10">
                  <CollectionChips activeHandle={handle} collections={collections} />
                  <div className="md:ml-auto md:shrink-0">
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
    <Page aria-busy="true" className="pt-6 md:pt-8">
      <Container>
        <div className="grid gap-5 md:gap-6">
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
      className="scrollbar-hide -mx-5 flex gap-5 overflow-x-auto px-5 md:mx-0 md:px-0"
    >
      <Link
        aria-current={activeHandle === "all" ? "page" : undefined}
        className="shrink-0 border-b border-transparent pb-1 pt-1.5 text-xs uppercase tracking-wider data-[active=true]:border-foreground"
        data-active={activeHandle === "all"}
        href="/collections/all"
      >
        All products
      </Link>
      {visible.map((collection) => (
        <Link
          aria-current={collection.handle === activeHandle ? "page" : undefined}
          className="shrink-0 border-b border-transparent pb-1 pt-1.5 text-xs uppercase tracking-wider data-[active=true]:border-foreground"
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
        <h1 className="text-lg uppercase leading-[23px] tracking-wider">
          <Link href={`/collections/${handle}`}>{title}</Link>
        </h1>
        {description && (
          <p className="mt-1.5 max-w-[60rem] text-xs leading-[18px] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </>
  );
}
