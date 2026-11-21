import { cn } from "cn";
import { type ReactNode, Suspense } from "react";

import { BundleComponents, BundleParents } from "@/components/product-detail/bundle-components";
import { BuyButtons, PurchaseOptions } from "@/components/product-detail/buy-buttons";
import { GiftCardPurchaseForm } from "@/components/product-detail/gift-card-purchase-form";
import { ProductOpenGraph } from "@/components/product-detail/open-graph";
import { ProductAccordion } from "@/components/product-detail/product-accordion";
import {
  ProductForm,
  ProductFormOptions,
  ProductFormPrice,
} from "@/components/product-detail/product-form";
import { ProductInfoOptions } from "@/components/product-detail/product-info";
import { ProductMedia } from "@/components/product-detail/product-media";
import { ProductPrice } from "@/components/product-detail/product-price";
import { ProductSchema } from "@/components/product-detail/schema";
import { BreadcrumbSchema } from "@/components/schema/breadcrumb-schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { shopConfig } from "@/lib/config";
import {
  getLowStockLabel,
  getProductPurchaseOptions,
  getSelectedColorImage,
  getSharedMedia,
  getSizeGuideCategory,
  hasColorImagePartitioning,
  toProductFormInput,
  toStaticOptionGroups,
} from "@/lib/product";
import { isSizeOption, sortSizeValues } from "@/lib/product/sizes";
import { type SelectedOptions } from "@/lib/product/types";
import type { ProductDetails, ProductVariant } from "@/lib/product/types";

export function ProductDetailSection({
  product,
  selectedOptions,
  variantPromise,
}: {
  product: ProductDetails;
  selectedOptions: SelectedOptions;
  variantPromise: Promise<ProductVariant | undefined>;
}) {
  return (
    <>
      <ProductSchema
        product={{
          handle: product.handle,
          title: product.title,
          description: product.description,
          images: product.images,
          vendor: product.vendor,
          currencyCode: product.currencyCode,
          priceRange: product.priceRange,
          offerCount: product.variantsCount,
          availableForSale: product.availableForSale,
          sku: product.defaultVariantSku,
        }}
      />
      <ProductOpenGraph
        availableForSale={product.availableForSale}
        price={product.priceRange.minVariantPrice}
      />
      <BreadcrumbSchema
        items={[
          { name: shopConfig.site.name, path: "/" },
          { name: product.title, path: `/products/${product.handle}` },
        ]}
      />
      <div className="grid grid-cols-1 items-start desktop:grid-cols-[minmax(0,800fr)_minmax(0,592fr)] desktop:px-(--gutter)">
        <ProductMediaArea product={product} selectedOptions={selectedOptions} />
        <ProductInfoArea product={product} variantPromise={variantPromise} />
      </div>
    </>
  );
}

function ProductMediaArea({
  product,
  selectedOptions,
}: {
  product: ProductDetails;
  selectedOptions: SelectedOptions;
}) {
  if (!hasColorImagePartitioning(product.options)) {
    return <ProductMedia media={product.media} title={product.title} />;
  }

  return (
    <ProductMedia
      colorImage={getSelectedColorImage(product, selectedOptions)}
      media={getSharedMedia(product.media, product.options)}
      title={product.title}
    />
  );
}

function ProductInfoArea({
  product,
  variantPromise,
}: {
  product: ProductDetails;
  variantPromise: Promise<ProductVariant | undefined>;
}) {
  const { options, descriptionHtml } = product;
  const uniformStock = product.allVariantsInStock;
  const singleVariant = product.variantsCount === 1;
  const showBuyLabel = uniformStock && !singleVariant;
  const allInStock = product.defaultVariant?.availableForSale ?? product.availableForSale;
  const hasOptions = options.some((option) => option.values.length > 1);
  return (
    <div className="px-(--gutter) pt-(--gutter) pb-10 desktop:sticky desktop:top-(--header-bar-h) desktop:max-h-[calc(100svh-var(--header-bar-h))] desktop:self-start desktop:overflow-y-auto desktop:px-20 desktop:pt-[calc(140px-var(--header-bar-h))] desktop:pb-[140px]">
      <div className="mx-auto grid w-full max-w-[432px] gap-10">
        <div className="grid gap-3" data-slot="product-info-header">
          <h1 className="type-meta-semibold text-ink">{product.title}</h1>
          {product.hasUniformPricing ? (
            <ProductPrice
              amount={product.priceRange.minVariantPrice.amount}
              currencyCode={product.priceRange.minVariantPrice.currencyCode}
              compareAtAmount={product.compareAtPriceRange?.minVariantPrice.amount}
            />
          ) : null}
        </div>

        <div className="grid gap-10">
          {singleVariant ? (
            <ProductInfoContent
              priceSlot={
                !product.hasUniformPricing ? (
                  <Suspense fallback={<div className="h-7" aria-hidden />}>
                    <ResolvedProductPrice variantPromise={variantPromise} />
                  </Suspense>
                ) : undefined
              }
              product={product}
              selectedVariant={product.defaultVariant}
            />
          ) : (
            <Suspense
              fallback={
                <ProductInfoFallback
                  allInStock={allInStock}
                  hasOptions={hasOptions}
                  product={product}
                  showLabel={showBuyLabel}
                />
              }
            >
              <ResolvedProductInfo product={product} variantPromise={variantPromise} />
            </Suspense>
          )}

          {!product.isGiftCard && shopConfig.pdp.bundles.isEnabled ? (
            <BundleRelationships variant={product.defaultVariant} />
          ) : null}

          <ProductAccordion descriptionHtml={descriptionHtml} />

          <div className="flex">
            <a
              className="type-control focus-ring inline-flex min-h-9 items-center text-ink-muted underline underline-offset-4"
              href={`mailto:${shopConfig.site.contact.email}`}
            >
              need help? contact us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

async function ResolvedProductPrice({
  variantPromise,
}: {
  variantPromise: Promise<ProductVariant | undefined>;
}) {
  const variant = await variantPromise;
  return (
    <ProductFormPrice
      fallbackVariant={
        variant ? { compareAtPrice: variant.compareAtPrice, price: variant.price } : undefined
      }
    />
  );
}

async function ResolvedProductInfo({
  product,
  variantPromise,
}: {
  product: ProductDetails;
  variantPromise: Promise<ProductVariant | undefined>;
}) {
  return <ProductInfoContent product={product} selectedVariant={await variantPromise} />;
}

// The store is seeded from the URL-resolved variant so server HTML and client state agree on first paint.
function ProductInfoContent({
  priceSlot,
  product,
  selectedVariant,
}: {
  priceSlot?: ReactNode;
  product: ProductDetails;
  selectedVariant: ProductVariant | undefined;
}) {
  const formProduct = toProductFormInput(product, selectedVariant);
  const fallbackVariant = formProduct.selectedOrFirstAvailableVariant ?? undefined;
  const hasOptions = product.options.some((option) => option.values.length > 1);
  const sizeOption = product.options.find((option) => isSizeOption(option.name));

  return (
    <ProductForm product={formProduct}>
      <div className="grid gap-10">
        {!product.hasUniformPricing ? (
          <div data-slot="product-info-price">
            {priceSlot ?? <ProductFormPrice fallbackVariant={fallbackVariant} />}
          </div>
        ) : null}
        {hasOptions ? (
          <ProductFormOptions
            handle={product.handle}
            sizeGuideCategory={getSizeGuideCategory(product.productType)}
          />
        ) : null}
        {product.isGiftCard ? (
          <GiftCardPurchaseForm />
        ) : (
          <BuyButtons
            fallbackVariant={fallbackVariant}
            availableForSale={product.availableForSale}
            buyWithShop={shopConfig.pdp.buyWithShop.isEnabled}
            notifyTarget={{
              image: selectedVariant?.image ?? product.featuredImage,
              price: selectedVariant?.price ?? product.priceRange.minVariantPrice,
              title: product.title,
            }}
            sizeOption={
              sizeOption
                ? {
                    name: sizeOption.name,
                    values: sortSizeValues(sizeOption.values).map((value) => value.name),
                  }
                : undefined
            }
          />
        )}
      </div>
    </ProductForm>
  );
}

function ProductInfoFallback({
  showLabel,
  allInStock,
  hasOptions,
  product,
}: {
  allInStock: boolean;
  hasOptions: boolean;
  product: ProductDetails;
  showLabel: boolean;
}) {
  return (
    <div className="grid gap-10">
      {!product.hasUniformPricing ? <div className="h-7" aria-hidden /> : null}
      {hasOptions ? (
        <ProductInfoOptions
          lowStockLabel={getLowStockLabel(product.defaultVariant?.quantityAvailable)}
          options={toStaticOptionGroups(product)}
          hideImages
          sizeGuideCategory={getSizeGuideCategory(product.productType)}
        />
      ) : null}
      {product.isGiftCard ? (
        <GiftCardPurchaseFormFallback />
      ) : (
        <BuyButtonsFallback
          allInStock={allInStock}
          showLabel={showLabel}
          variant={product.defaultVariant}
        />
      )}
    </div>
  );
}

// Bundle relationships are product-level, so keep them in the static shell.
function BundleRelationships({ variant }: { variant: ProductVariant | undefined }) {
  if (!variant) return null;
  if (variant.components.length === 0 && variant.bundleParents.length === 0) return null;
  return (
    <div className="grid gap-5">
      <BundleComponents components={variant.components} title="Bundle Includes" />
      <BundleParents variants={variant.bundleParents} title="Available in Bundles" />
    </div>
  );
}

function GiftCardPurchaseFormFallback() {
  // Match the resolved form's geometry to avoid layout shift.
  return (
    <div className="grid gap-5">
      <div className="grid gap-2.5">
        <div className="grid gap-2.5">
          <Label>Recipient email</Label>
          <Input type="email" disabled placeholder="friend@example.com" />
        </div>
        <div className="grid gap-2.5">
          <Label>Recipient name</Label>
          <Input type="text" disabled placeholder="Friend's name (optional)" />
        </div>
        <div className="grid gap-2.5">
          <Label>Message</Label>
          <Textarea rows={3} disabled placeholder="Write a personal note (optional)" />
        </div>
        <div className="grid gap-3 border p-3">
          <div className="flex items-center justify-between gap-2.5">
            <Label>Schedule for later</Label>
            <span className="inline-flex h-5 w-9 items-center border border-input bg-surface opacity-50" />
          </div>
        </div>
      </div>
      <div className="type-control flex h-10 w-full cursor-not-allowed items-center justify-center bg-ink text-inverse opacity-50">
        Add to cart
      </div>
    </div>
  );
}

function BuyButtonsFallback({
  allInStock,
  showLabel,
  variant,
}: {
  allInStock: boolean;
  showLabel: boolean;
  variant: ProductVariant | undefined;
}) {
  const { plans, selectedPlan } = getProductPurchaseOptions(variant);
  const notifyOnly = !variant || !allInStock;
  return (
    <div className="grid gap-6">
      {variant ? (
        <PurchaseOptions
          disabled
          plans={plans}
          price={variant.price}
          requiresSellingPlan={variant.requiresSellingPlan}
          selectedPlan={selectedPlan}
        />
      ) : null}
      <div
        className={cn(
          "type-control flex w-full items-center justify-center",
          notifyOnly
            ? "h-[50px] border border-ink bg-transparent text-ink"
            : "h-10 bg-surface text-ink-muted",
        )}
      >
        {notifyOnly ? "Notify me when available" : showLabel ? "Add to cart" : null}
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-1 items-start desktop:grid-cols-[minmax(0,800fr)_minmax(0,592fr)] desktop:px-(--gutter)"
    >
      <div>
        <div className="aspect-[2/3] w-full bg-surface desktop:hidden" />
        <div className="hidden desktop:block desktop:pt-[75px]">
          <div className="aspect-[800/1432] w-full border border-ink bg-surface" />
          <div className="grid grid-cols-2">
            <div className="aspect-[3/4] w-full bg-surface" />
            <div className="aspect-[3/4] w-full bg-surface" />
          </div>
        </div>
      </div>
      <div className="px-(--gutter) pt-(--gutter) pb-10 desktop:sticky desktop:top-(--header-bar-h) desktop:px-20 desktop:pb-[140px] desktop:pt-[calc(140px-var(--header-bar-h))]">
        <div className="mx-auto grid w-full max-w-[432px] gap-10">
          <div className="grid gap-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid gap-10">
            <div className="grid gap-3">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-3">
                <Skeleton className="size-4" />
                <Skeleton className="size-4" />
                <Skeleton className="size-4" />
              </div>
            </div>
            <div className="grid gap-3">
              <Skeleton className="h-4 w-16" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 7 }, (_, index) => (
                  <Skeleton className="h-[26px] w-10 desktop:h-11 desktop:w-14" key={index} />
                ))}
              </div>
            </div>
            <div className="grid gap-6">
              <Skeleton className="h-10 w-full" />
              {shopConfig.pdp.buyWithShop.isEnabled ? <Skeleton className="h-10 w-full" /> : null}
            </div>
          </div>
          <div className="grid gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
