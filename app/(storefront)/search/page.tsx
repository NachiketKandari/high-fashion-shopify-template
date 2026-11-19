import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchViewedTracker } from "@/components/analytics/trackers";
import { CollectionBrowseProvider } from "@/components/collections/collection-browse-provider";
import { CollectionFilters } from "@/components/collections/filters";
import { InfiniteProductGrid } from "@/components/collections/infinite-product-grid";
import { BrowseFallback, BrowseToolbar } from "@/components/collections/toolbar";
import { ProductCard } from "@/components/product-card/product-card";
import { SearchExplorer } from "@/components/search/search-explorer";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { SEARCH_SORT_EXCLUDE } from "@/lib/collections";
import { readBrowseState } from "@/lib/collections/server";
import type { BrowseResults, BrowseState } from "@/lib/collections/types";
import { TRENDING_SEARCH_TERMS } from "@/lib/search";
import { fetchSearchResults } from "@/lib/search/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = getParam(resolvedSearchParams, "q") ?? "";
  const hasQuery = query.length > 0;
  const title = hasQuery ? `Search results for "${query}"` : "Search";
  const description = hasQuery
    ? `Find products matching "${query}"`
    : "Search for products in our store";
  return {
    title,
    description,
    alternates: buildAlternates({
      pathname: "/search",
      searchParams: resolvedSearchParams,
    }),
    openGraph: buildOpenGraph({
      title,
      description,
      url: "/search",
      type: "website",
    }),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.png"],
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  // Don't await searchParams here — it would force the route fully dynamic.
  const statePromise = readBrowseState(searchParams);
  const resultsPromise = searchParams.then((resolved) =>
    fetchSearchResults({ query: getParam(resolved, "q")?.trim(), statePromise }),
  );
  return (
    <Page className="pt-6 desktop:pt-1.5">
      <Container>
        <Suspense fallback={<SearchPageSkeleton />}>
          <SearchExperience
            resultsPromise={resultsPromise}
            searchParamsPromise={searchParams}
            statePromise={statePromise}
          />
        </Suspense>
      </Container>
    </Page>
  );
}

async function SearchExperience({
  resultsPromise,
  searchParamsPromise,
  statePromise,
}: {
  resultsPromise: Promise<BrowseResults>;
  searchParamsPromise: PageProps<"/search">["searchParams"];
  statePromise: Promise<BrowseState>;
}) {
  const query = (getParam(await searchParamsPromise, "q") ?? "").trim();
  return (
    <>
      <Suspense fallback={null}>
        <SearchViewedTracker searchTerm={query} />
      </Suspense>
      <SearchExplorer initialQuery={query} key={query}>
        {query ? (
          <Suspense fallback={<BrowseFallback />}>
            <SearchResults
              query={query}
              resultsPromise={resultsPromise}
              statePromise={statePromise}
            />
          </Suspense>
        ) : null}
      </SearchExplorer>
    </>
  );
}

async function SearchResults({
  query,
  resultsPromise,
  statePromise,
}: {
  query: string;
  resultsPromise: Promise<BrowseResults>;
  statePromise: Promise<BrowseState>;
}) {
  const results = await resultsPromise;

  if (results.products.length === 0) {
    return <SearchZeroState query={query} />;
  }

  return (
    <div className="grid gap-6">
      <h1 className="type-h3 text-ink">showing all results for ‘{query}’</h1>
      <CollectionBrowseProvider handle={`search:${query}`} path="/search" state={statePromise}>
        <div className="grid gap-6">
          <BrowseToolbar
            filters={<CollectionFilters facets={results.facets} />}
            sortExclude={SEARCH_SORT_EXCLUDE}
          />
          <InfiniteProductGrid
            initialPageInfo={results.pageInfo}
            initialProductIds={results.products.map((product) => product.id)}
            source={results.source}
          >
            {results.products.map((product, index) => (
              <ProductCard
                captionLayout="row"
                key={product.id}
                loading={index < 4 ? "eager" : "lazy"}
                product={product}
                showActions={false}
                showSwatches={false}
              />
            ))}
          </InfiniteProductGrid>
        </div>
      </CollectionBrowseProvider>
    </div>
  );
}

function SearchZeroState({ query }: { query: string }) {
  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="type-h3 text-ink">No results found for ‘{query}’</h1>
        <p className="type-body text-ink-muted">Check the spelling, or try a different term.</p>
      </div>
      <div className="grid gap-4 pl-8">
        <p className="type-h3 text-ink-muted">Trending searches</p>
        <ul className="grid gap-px" role="list">
          {TRENDING_SEARCH_TERMS.map((trending) => (
            <li key={trending}>
              <Link
                className="type-h3 focus-ring flex min-h-9 items-center text-ink"
                href={`/search?q=${encodeURIComponent(trending)}`}
              >
                {trending}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-10">
      <Skeleton className="h-[57px] w-full" />
      <div className="grid gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  );
}
