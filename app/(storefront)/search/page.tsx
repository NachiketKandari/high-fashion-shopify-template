import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchViewedTracker } from "@/components/analytics/trackers";
import { CollectionBrowseProvider } from "@/components/collections/collection-browse-provider";
import { InfiniteProductGrid } from "@/components/collections/infinite-product-grid";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card/product-card";
import { ProductsGridSkeleton } from "@/components/product/products-grid";
import { SearchExplorer } from "@/components/search/search-explorer";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { PRODUCTS_PER_PAGE } from "@/lib/collections";
import { readBrowseState } from "@/lib/collections/server";
import type { BrowseResults, BrowseState } from "@/lib/collections/types";
import { TRENDING_SEARCH_TERMS } from "@/lib/search";
import { fetchClosestSearchResults, fetchSearchResults } from "@/lib/search/server";
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
    <Page className="desktop:pt-20">
      <Container className="max-w-[1440px] pb-10 desktop:pb-20">
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
          <Suspense fallback={<SearchResultsSkeleton />}>
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
    <>
      <div className="grid gap-10 [--grid-row-gap:40px]">
        <h1 className="type-h3 text-ink">showing all results for ‘{query}’</h1>
        <CollectionBrowseProvider handle={`search:${query}`} path="/search" state={statePromise}>
          <InfiniteProductGrid
            cardProps={{
              captionLayout: "compact",
              className: "[&>div:first-child]:aspect-[348/447]",
              showActions: false,
              showSwatches: false,
            }}
            initialPageInfo={results.pageInfo}
            initialProductIds={results.products.map((product) => product.id)}
            showEndMessage={false}
            source={results.source}
          >
            {results.products.map((product, index) => (
              <SearchProductCard
                key={product.id}
                loading={index < 4 ? "eager" : "lazy"}
                product={product}
              />
            ))}
          </InfiniteProductGrid>
        </CollectionBrowseProvider>
      </div>
      <SearchFooter />
    </>
  );
}

function SearchProductCard({
  loading,
  product,
}: {
  loading?: "eager" | "lazy";
  product: BrowseResults["products"][number];
}) {
  return (
    <ProductCard
      captionLayout="compact"
      className="[&>div:first-child]:aspect-[348/447]"
      loading={loading}
      product={product}
      showActions={false}
      showSwatches={false}
    />
  );
}

async function SearchZeroState({ query }: { query: string }) {
  const closest = await fetchClosestSearchResults();

  if (closest.length === 0) {
    return (
      <>
        <div className="grid gap-8">
          <h1 className="type-h3 text-ink">No results found for ‘{query}’</h1>
          <div className="grid gap-4 pl-8">
            <p className="type-h3 text-ink-muted">Trending search -</p>
            <ul className="grid gap-4" role="list">
              {TRENDING_SEARCH_TERMS.map((trending) => (
                <li key={trending}>
                  <Link
                    className="type-h3 focus-ring flex text-ink"
                    href={`/search?q=${encodeURIComponent(trending)}`}
                  >
                    {trending}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <SearchFooter />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-10 [--grid-row-gap:40px]">
        <h1 className="type-h3 text-ink">No results found for ‘{query}’, closest results -</h1>
        <div className="-mx-(--gutter) grid grid-cols-2 gap-px tablet:mx-0 tablet:grid-cols-3 tablet:gap-x-(--grid-gap) tablet:gap-y-(--grid-row-gap) desktop:grid-cols-4">
          {closest.map((product, index) => (
            <SearchProductCard
              key={product.id}
              loading={index < 4 ? "eager" : "lazy"}
              product={product}
            />
          ))}
        </div>
      </div>
      <SearchFooter />
    </>
  );
}

function SearchFooter() {
  return (
    <div className="-mx-(--gutter) -mb-10 desktop:-mb-20">
      <Footer newsletterInputId="search-footer-newsletter-email" />
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-10 [--grid-row-gap:40px]">
      <Skeleton className="h-5 w-64" />
      <ProductsGridSkeleton count={Math.min(PRODUCTS_PER_PAGE, 8)} />
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-10">
      <div className="grid gap-3 tablet:grid-cols-[1fr_276px] tablet:gap-10">
        <Skeleton className="h-[57px] w-full" />
        <Skeleton className="h-[57px] w-full tablet:max-w-[276px] tablet:justify-self-end" />
      </div>
      <div className="grid gap-4 pl-8">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  );
}
