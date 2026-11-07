import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductViewedTracker } from "@/components/analytics/trackers";
import {
  ProductDetailSection,
  ProductDetailSkeleton,
} from "@/components/product-detail/product-detail-section";
import { RecentlyViewedRecorder } from "@/components/product-detail/recently-viewed";
import { DeferredRelatedProducts } from "@/components/product/deferred-related-products";
import { RelatedProductsSection } from "@/components/product/related-products-section";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";
import { defaultSelectedOptions, parseSelectedOptions, toSelectedOptionList } from "@/lib/product";
import {
  getProduct,
  getProductRecommendations,
  getSearchIndexProducts,
} from "@/lib/product/server";
import { type SelectedOptions } from "@/lib/product/types";
import type { ProductVariant } from "@/lib/product/types";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { fetchProductVariant } from "@/lib/shopify/operations/products/server";
import { PLACEHOLDER_HANDLE } from "@/lib/static-params";

async function buildProductMetadata(handle: string, canonicalPath: string): Promise<Metadata> {
  const product = await getProduct({
    handle,
  });
  if (!product) notFound();
  const images = product.featuredImage
    ? [
        {
          url: product.featuredImage.url,
          width: product.featuredImage.width,
          height: product.featuredImage.height,
          alt: product.featuredImage.altText,
        },
      ]
    : ["/og-default.png"];
  return {
    title: product.seo.title,
    description: product.seo.description,
    alternates: buildAlternates({
      pathname: canonicalPath,
    }),
    openGraph: buildOpenGraph({
      title: product.seo.title,
      description: product.seo.description,
      url: canonicalPath,
      images,
    }),
    twitter: {
      card: "summary_large_image",
      title: product.seo.title,
      description: product.seo.description,
      images,
    },
  };
}

export async function generateStaticParams() {
  try {
    const { products } = await getSearchIndexProducts({ limit: 1 });
    const first = products[0];
    return [{ handle: first ? first.handle : PLACEHOLDER_HANDLE }];
  } catch {
    return [{ handle: PLACEHOLDER_HANDLE }];
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  if (handle === PLACEHOLDER_HANDLE) return {};
  return buildProductMetadata(handle, `/products/${handle}`);
}

export default function ProductPage({ params, searchParams }: PageProps<"/products/[handle]">) {
  return (
    <Page className="pt-0">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductPageContent params={params} searchParams={searchParams} />
      </Suspense>
    </Page>
  );
}

async function ProductPageContent({
  params,
  searchParams,
}: Pick<PageProps<"/products/[handle]">, "params" | "searchParams">) {
  const { handle } = await params;
  if (handle === PLACEHOLDER_HANDLE) notFound();
  // Recommendations depend only on the handle, so start them beside the product read instead of after it.
  const relatedProductsPromise = shopConfig.pdp.relatedProducts.isEnabled
    ? getProductRecommendations({ handle, intent: "RELATED" })
    : null;
  const [product, resolvedSearchParams] = await Promise.all([
    getProduct({
      handle,
    }),
    searchParams,
  ]);
  if (!product) notFound();

  // The media reads the URL selection synchronously so the first image can render before the live variant query resolves.
  const explicitOptions = parseSelectedOptions(product.options, resolvedSearchParams ?? {});
  const selectedOptions: SelectedOptions = {
    ...defaultSelectedOptions(product),
    ...explicitOptions,
  };
  const variantPromise: Promise<ProductVariant | undefined> =
    Object.keys(explicitOptions).length === 0
      ? Promise.resolve(product.defaultVariant)
      : // Uncached: the selected variant's price and stock are read live per request, and caching per option combination multiplies entries by variant count.
        fetchProductVariant({
          handle,
          selectedOptions: toSelectedOptionList(selectedOptions),
        });
  return (
    <>
      <Suspense fallback={null}>
        <ProductViewedTracker
          product={{
            handle: product.handle,
            id: product.id,
            title: product.title,
            vendor: product.vendor,
          }}
          variantPromise={variantPromise}
        />
      </Suspense>
      <RecentlyViewedRecorder
        product={{
          featuredImage: product.featuredImage,
          handle: product.handle,
          id: product.id,
          price: product.price,
          title: product.title,
        }}
      />
      <ProductDetailSection
        product={product}
        selectedOptions={selectedOptions}
        variantPromise={variantPromise}
      />
      {relatedProductsPromise ? (
        <Container>
          <div className="py-16 desktop:py-20">
            <DeferredRelatedProducts>
              <RelatedProductsSection limit={4} productsPromise={relatedProductsPromise} />
            </DeferredRelatedProducts>
          </div>
        </Container>
      ) : null}
    </>
  );
}
