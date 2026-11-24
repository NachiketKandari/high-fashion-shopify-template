"use client";

import type { PredictiveSearchData } from "@shopify/hydrogen";
import { getPredictiveSearchItemUrl } from "@shopify/hydrogen";
import {
  usePredictiveSearch as useHydrogenPredictiveSearch,
  usePredictiveSearchActions,
} from "@shopify/hydrogen/react";
import { useCallback, useState } from "react";

import type { PredictiveSearchResult } from "@/lib/search/types";
import { SHOPIFY_ROUTE_TEMPLATES } from "@/lib/shopify/routing";

type HydrogenProduct = PredictiveSearchData["items"]["products"][number] & {
  featuredImage: {
    altText?: string | null;
    height: number;
    url: string;
    width: number;
  } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
};

type HydrogenQuery = PredictiveSearchData["items"]["queries"][number] & {
  styledText: string;
};

interface HydrogenPredictiveSearchData extends PredictiveSearchData {
  items: Omit<PredictiveSearchData["items"], "products" | "queries"> & {
    products: HydrogenProduct[];
    queries: HydrogenQuery[];
  };
}

export function usePredictiveSearch() {
  const { clear, search } = usePredictiveSearchActions();
  const state = useHydrogenPredictiveSearch<HydrogenPredictiveSearchData>();
  const [activeIndex, setActiveIndex] = useState(-1);
  // Previous results stay in place while a new search loads; a failed search shows no rows.
  const results: PredictiveSearchResult | null =
    state.status === "loading" || state.status === "success"
      ? {
          collections: state.result.items.collections.map((collection) => ({
            href: getPredictiveSearchItemUrl(collection, {
              routes: SHOPIFY_ROUTE_TEMPLATES,
              term: state.term,
            }),
            id: collection.id,
            image:
              collection.image?.height && collection.image.width
                ? {
                    altText: collection.image.altText ?? "",
                    height: collection.image.height,
                    url: collection.image.url,
                    width: collection.image.width,
                  }
                : null,
            title: collection.title,
          })),
          products: state.result.items.products.map((product) => ({
            featuredImage: product.featuredImage
              ? {
                  altText: product.featuredImage.altText ?? "",
                  height: product.featuredImage.height,
                  url: product.featuredImage.url,
                  width: product.featuredImage.width,
                }
              : null,
            href: getPredictiveSearchItemUrl(product, {
              routes: SHOPIFY_ROUTE_TEMPLATES,
              term: state.term,
            }),
            id: product.id,
            price: product.priceRange.minVariantPrice,
            title: product.title,
          })),
          queries: state.result.items.queries,
        }
      : null;

  const setQuery = useCallback(
    (query: string) => {
      setActiveIndex(-1);
      void search(query);
    },
    [search],
  );

  const reset = useCallback(() => {
    clear();
    setActiveIndex(-1);
  }, [clear]);

  return {
    activeIndex,
    error: state.error,
    isLoading: state.status === "loading",
    query: state.term,
    reset,
    results,
    setActiveIndex,
    setQuery,
  };
}
