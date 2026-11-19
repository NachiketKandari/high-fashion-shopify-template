import { ProductCard } from "@/components/product-card/product-card";
import { PRODUCTS_PER_PAGE } from "@/lib/collections";
import type { BrowseResults } from "@/lib/collections/types";

import { BrowseEmpty } from "./browse-empty";
import { BROWSE_GRID_CLASS, BrowseGridSkeleton } from "./browse-grid";
import { BrowsePublisher } from "./collection-browse-provider";
import { InfiniteProductGrid } from "./infinite-product-grid";

interface CollectionResultsProps {
  results: BrowseResults | Promise<BrowseResults>;
}

interface BrowseResultsGridProps {
  results: BrowseResults;
}

export function BrowseResultsFallback() {
  return <BrowseGridSkeleton count={PRODUCTS_PER_PAGE} />;
}

// Streams the collection page's grid under the layout's CollectionBrowseFrame and hands its facets and data search to the layout's toolbar.
export async function CollectionResults({ results }: CollectionResultsProps) {
  const resolved = await results;
  return (
    <>
      <BrowsePublisher dataSearch={resolved.dataSearch} facets={resolved.facets} />
      <BrowseResultsGrid results={resolved} />
    </>
  );
}

function BrowseResultsGrid({ results }: BrowseResultsGridProps) {
  const { dataSearch, pageInfo, products, source } = results;
  if (products.length === 0) {
    return (
      <BrowseEmpty
        browseAllHref={
          source.type === "search" || source.collection !== "all" ? "/collections/all" : undefined
        }
        query={source.type === "search" ? source.query : undefined}
      />
    );
  }
  return (
    <InfiniteProductGrid
      gridClassName={BROWSE_GRID_CLASS}
      key={`${JSON.stringify(source)}?${dataSearch}`}
      initialPageInfo={pageInfo}
      initialProductIds={products.map((product) => product.id)}
      source={source}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          loading={index < 4 ? "eager" : "lazy"}
          outOfStockText="Out of stock"
          product={product}
          variant="browse"
        />
      ))}
    </InfiniteProductGrid>
  );
}
