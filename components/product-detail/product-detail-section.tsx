import { cn } from "cn";
import { MinusIcon, PlusIcon } from "lucide-react";
import { type ReactNode, Suspense } from "react";

import { WishlistButton } from "@/components/product-card/wishlist-button";
import { BundleComponents, BundleParents } from "@/components/product-detail/bundle-components";
import { BuyButtons, PurchaseOptions } from "@/components/product-detail/buy-buttons";
import { BuyWithShopLogo } from "@/components/product-detail/buy-with-shop-logo";
import { GiftCardPurchaseForm } from "@/components/product-detail/gift-card-purchase-form";
import { ProductOpenGraph } from "@/components/product-detail/open-graph";
import {
  ProductForm,
  ProductFormOptions,
  ProductFormPrice,
} from "@/components/product-detail/product-form";
import { ProductInfoOptions } from "@/components/product-detail/product-info";
import {
  ColorImageCarouselItems,
  ColorImageGrid,
  ProductMedia,
} from "@/components/product-detail/product-media";
import { ProductPrice } from "@/components/product-detail/product-price";
import { ProductTabs } from "@/components/product-detail/product-tabs";
import { ProductSchema } from "@/components/product-detail/schema";
import { BreadcrumbSchema } from "@/components/schema/breadcrumb-schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { shopConfig } from "@/lib/config";
import {
  getProductPurchaseOptions,
  getSelectedColorImage,
  getSharedImages,
  hasColorImagePartitioning,
  toProductFormInput,
  toStaticOptionGroups,
} from "@/lib/product";
import { type SelectedOptions } from "@/lib/product/types";
import type { ProductDetails, ProductVariant } from "@/lib/product/types";

export function ProductDetailSection({
  product,
  selectedOptionsPromise,
  variantPromise,
}: {
  product: ProductDetails;
  selectedOptionsPromise: Promise<SelectedOptions>;
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
      <div className="grid grid-cols-1 items-start lg:grid-cols-2">
        <ProductMediaArea product={product} selectedOptionsPromise={selectedOptionsPromise} />
        <ProductInfoArea product={product} variantPromise={variantPromise} />
      </div>
    </>
  );
}

function ProductMediaArea({
  product,
  selectedOptionsPromise,
}: {
  product: ProductDetails;
  selectedOptionsPromise: Promise<SelectedOptions>;
}) {
  if (!hasColorImagePartitioning(product.options)) {
    return (
      <ProductMedia otherImages={product.images} videos={product.videos} title={product.title} />
    );
  }

  return (
    <ProductMedia
      otherImages={getSharedImages(product.images, product.options)}
      videos={product.videos}
      title={product.title}
      desktopSlot={
        // Color image is the LCP slot; a pulsing skeleton flashes harder than an empty image canvas.
        <Suspense fallback={<div className="aspect-square w-full" />}>
          <ResolvedColorImageGrid
            product={product}
            selectedOptionsPromise={selectedOptionsPromise}
          />
        </Suspense>
      }
      mobileSlot={
        <Suspense
          fallback={
            <div className="relative shrink-0 w-full snap-start snap-always overflow-hidden aspect-square" />
          }
        >
          <ResolvedColorImageCarousel
            product={product}
            selectedOptionsPromise={selectedOptionsPromise}
          />
        </Suspense>
      }
    />
  );
}

async function ResolvedColorImageGrid({
  product,
  selectedOptionsPromise,
}: {
  product: ProductDetails;
  selectedOptionsPromise: Promise<SelectedOptions>;
}) {
  const image = getSelectedColorImage(product, await selectedOptionsPromise);
  if (!image) return null;
  return <ColorImageGrid images={[image]} title={product.title} />;
}

async function ResolvedColorImageCarousel({
  product,
  selectedOptionsPromise,
}: {
  product: ProductDetails;
  selectedOptionsPromise: Promise<SelectedOptions>;
}) {
  const image = getSelectedColorImage(product, await selectedOptionsPromise);
  if (!image) return null;
  return <ColorImageCarouselItems images={[image]} title={product.title} />;
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
    <div className="px-5 py-7 lg:sticky lg:top-[76px] lg:max-h-[calc(100svh-76px)] lg:self-start lg:overflow-y-auto lg:px-0 lg:pb-6 lg:pt-[64px]">
      <div className="mx-auto grid w-full max-w-[408px] gap-7">
        <div className="grid gap-2" data-slot="product-info-header">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-[22px] uppercase leading-[29px] tracking-wider text-foreground">
              {product.title}
            </h1>
            <WishlistButton product={product} />
          </div>
          {product.hasUniformPricing ? (
            <ProductPrice
              amount={product.priceRange.minVariantPrice.amount}
              currencyCode={product.priceRange.minVariantPrice.currencyCode}
              compareAtAmount={product.compareAtPriceRange?.minVariantPrice.amount}
            />
          ) : null}
        </div>

        <div className="grid gap-7">
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

          <ProductTabs descriptionHtml={descriptionHtml} />

          <div className="flex justify-end">
            <a
              className="text-2xs uppercase tracking-wider underline underline-offset-4"
              href="mailto:hi@politesociety.in"
            >
              Need help?
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

  return (
    <ProductForm product={formProduct}>
      <div className="grid gap-10">
        {!product.hasUniformPricing ? (
          <div data-slot="product-info-price">
            {priceSlot ?? <ProductFormPrice fallbackVariant={fallbackVariant} />}
          </div>
        ) : null}
        {hasOptions ? <ProductFormOptions handle={product.handle} /> : null}
        {product.isGiftCard ? (
          <GiftCardPurchaseForm />
        ) : (
          <BuyButtons
            fallbackVariant={fallbackVariant}
            availableForSale={product.availableForSale}
            buyWithShop={shopConfig.pdp.buyWithShop.isEnabled}
            quantityPicker={shopConfig.pdp.quantityPicker.isEnabled}
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
        <ProductInfoOptions options={toStaticOptionGroups(product)} hideImages />
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
        <div className="grid gap-3 rounded-lg border p-3">
          <div className="flex items-center justify-between gap-2.5">
            <Label>Schedule for later</Label>
            <span className="inline-flex h-[1.15rem] w-8 items-center rounded-full bg-input opacity-50" />
          </div>
        </div>
      </div>
      <div className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground opacity-50">
        Add to Cart
      </div>
    </div>
  );
}

function QuantityPickerFallback() {
  return (
    <div
      aria-hidden="true"
      className="grid h-9 w-24 shrink-0 grid-cols-[2rem_2rem_2rem] border border-rule bg-background"
    >
      <span className="flex size-9 items-center justify-center opacity-50">
        <MinusIcon className="size-3 shrink-0" />
      </span>
      <span className="flex h-9 w-8 items-center justify-center text-xs tabular-nums">1</span>
      <span className="flex size-9 items-center justify-center">
        <PlusIcon className="size-3 shrink-0" />
      </span>
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
  return (
    <div className="grid gap-2.5">
      {variant ? (
        <PurchaseOptions
          disabled
          plans={plans}
          price={variant.price}
          requiresSellingPlan={variant.requiresSellingPlan}
          selectedPlan={selectedPlan}
        />
      ) : null}
      <div className="flex flex-wrap gap-2.5">
        {shopConfig.pdp.quantityPicker.isEnabled ? <QuantityPickerFallback /> : null}
        <div className="flex h-12 min-w-40 flex-1 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground">
          {showLabel ? (allInStock ? "Add to Cart" : "Out of Stock") : null}
        </div>
      </div>
      {shopConfig.pdp.buyWithShop.isEnabled && !selectedPlan && !variant?.requiresSellingPlan ? (
        <div
          className={cn(
            "flex h-12 items-center justify-center rounded-lg bg-shop px-4 text-white",
            !allInStock && "invisible",
          )}
        >
          <BuyWithShopLogo aria-hidden="true" className="h-auto w-24.5" />
        </div>
      ) : null}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div aria-busy="true" className="grid grid-cols-1 items-start lg:grid-cols-2">
      <div>
        <div className="aspect-[2/3] w-full bg-accent lg:hidden" />
        <div className="hidden aspect-[2/3] w-full bg-accent lg:block" />
      </div>
      <div className="px-5 py-7 lg:sticky lg:top-[76px] lg:px-0 lg:py-6">
        <div className="mx-auto grid w-full max-w-[408px] gap-7">
          <div className="grid gap-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-7 w-24" />
          </div>
          <div className="grid gap-7">
            <div className="grid gap-5">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="size-2.5" />
                <Skeleton className="size-2.5" />
                <Skeleton className="size-2.5" />
              </div>
            </div>
            <div className="grid gap-2.5">
              <div className="flex flex-wrap gap-2.5">
                {shopConfig.pdp.quantityPicker.isEnabled ? <QuantityPickerFallback /> : null}
                <Skeleton className="h-9 min-w-0 flex-1" />
              </div>
              {shopConfig.pdp.buyWithShop.isEnabled ? <Skeleton className="h-9 w-full" /> : null}
            </div>
          </div>
          <div className="grid gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
