import { type ReactNode, Suspense } from "react";

import { ProductCard } from "@/components/product-card/product-card";
import { ProductsGridSkeleton } from "@/components/product/products-grid";
import { PRODUCTS_PER_PAGE } from "@/lib/collections";
import type { BrowseResults, BrowseState, SortValue } from "@/lib/collections/types";

import { BrowsePublisher, CollectionBrowseProvider } from "./collection-browse-provider";
import { CollectionFilters } from "./filters";
import { InfiniteProductGrid } from "./infinite-product-grid";
import { BrowseToolbar } from "./toolbar";

interface BrowseProps {
  path: string;
  resultCount?: ReactNode;
  results: Promise<BrowseResults>;
  sortExclude?: SortValue[];
  state: Promise<BrowseState>;
  storeKey: string;
}

interface CollectionResultsProps {
  results: BrowseResults | Promise<BrowseResults>;
}

interface BrowseResultsGridProps {
  results: BrowseResults;
}

export function Browse({ path, resultCount, results, sortExclude, state, storeKey }: BrowseProps) {
  return (
    <CollectionBrowseProvider handle={storeKey} path={path} state={state}>
      <BrowseToolbar
        filters={<CollectionFilters facets={results.then(({ facets }) => facets)} />}
        resultCount={resultCount}
        sortExclude={sortExclude}
      />
      <Suspense fallback={<BrowseResultsFallback />}>
        <StreamedResultsGrid results={results} />
      </Suspense>
    </CollectionBrowseProvider>
  );
}

export function BrowseResultsFallback() {
  return (
    <ProductsGridSkeleton
      count={PRODUCTS_PER_PAGE}
      className="grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4"
    />
  );
}

// Renders a collection page's grid under the layout's CollectionBrowseFrame and hands its facets and data search to the layout's toolbar.
export async function CollectionResults({ results }: CollectionResultsProps) {
  const resolved = await results;
  return (
    <>
      <BrowsePublisher dataSearch={resolved.dataSearch} facets={resolved.facets} />
      <BrowseResultsGrid results={resolved} />
    </>
  );
}

async function StreamedResultsGrid({ results }: { results: Promise<BrowseResults> }) {
  return <BrowseResultsGrid results={await results} />;
}

function BrowseResultsGrid({ results }: BrowseResultsGridProps) {
  const { dataSearch, pageInfo, products, source } = results;
  if (products.length === 0) {
    const query = source.type === "search" ? source.query : undefined;
    return (
      <div className="py-10 text-center">
        <h2 className="type-h2 mb-2">No products found</h2>
        <p className="type-body-sm text-ink-muted">
          {query ? `We couldn't find any products matching "${query}"` : "No products available"}
        </p>
      </div>
    );
  }
  return (
    <InfiniteProductGrid
      key={`${JSON.stringify(source)}?${dataSearch}`}
      initialPageInfo={pageInfo}
      initialProductIds={products.map((product) => product.id)}
      source={source}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          loading={index < 4 ? "eager" : "lazy"}
          product={product}
          outOfStockText="Out of stock"
        />
      ))}
    </InfiniteProductGrid>
  );
}
