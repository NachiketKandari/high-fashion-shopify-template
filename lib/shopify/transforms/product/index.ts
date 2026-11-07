import { flattenConnection } from "@shopify/hydrogen";

import type { Image, MediaItem } from "@/lib/media/types";
import type {
  Category,
  OptionValue,
  OptionValueSwatch,
  ProductCard,
  ProductDetails,
  ProductOption,
  ProductVariant,
  ProductVariantComponent,
  ProductVariantReference,
} from "@/lib/product/types";
import type {
  ShopifyBundleComponentVariant,
  ShopifyCategory,
  ShopifyImage,
  ShopifyMediaNode,
  ShopifyOption,
  ShopifyOptionValueSwatch,
  ShopifyProduct,
  ShopifyProductCard,
  ShopifyVariant,
} from "@/lib/shopify/transforms/product/types";

const MAX_IMAGE_WIDTH = 1920;

function resizedImageUrl(url: string, width: number, height: number) {
  if (
    width <= MAX_IMAGE_WIDTH ||
    !/cdn\.shopify\.com|politesocietyshop\.com\/cdn\/shop/.test(url)
  ) {
    return url;
  }
  const parsed = new URL(url);
  parsed.searchParams.set("width", String(MAX_IMAGE_WIDTH));
  return parsed.toString();
}

export function transformImage(image: ShopifyImage | null | undefined): Image | null {
  if (!image) return null;
  const originalWidth = image.width ?? 0;
  const originalHeight = image.height ?? 0;
  const width = originalWidth > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH : originalWidth;
  const height =
    originalWidth > MAX_IMAGE_WIDTH && originalHeight > 0
      ? Math.round((originalHeight * MAX_IMAGE_WIDTH) / originalWidth)
      : originalHeight;
  return {
    url: resizedImageUrl(image.url, originalWidth, originalHeight),
    altText: image.altText ?? "",
    width,
    height,
  };
}

function extractMediaFromProduct(product: ShopifyProduct): {
  images: Image[];
  media: MediaItem[];
} {
  const images: Image[] = [];
  const media: MediaItem[] = [];

  for (const node of flattenConnection<ShopifyMediaNode>(product.media)) {
    if (node.__typename === "MediaImage") {
      const img = transformImage(node.image);
      if (img) {
        images.push(img);
        media.push({ image: img, type: "image" });
      }
    } else if (node.__typename === "Video") {
      const mp4Sources = node.sources.filter((s) => s.mimeType.startsWith("video/mp4"));
      const bestSource = mp4Sources.sort((a, b) => b.width - a.width)[0] ?? node.sources[0];
      if (bestSource) {
        media.push({
          type: "video",
          video: {
            url: bestSource.url,
            previewImage: transformImage(node.previewImage),
            width: bestSource.width,
            height: bestSource.height,
          },
        });
      }
    }
  }

  return { images, media };
}

function transformCategory(category: ShopifyCategory | null | undefined): Category | null {
  if (!category) return null;
  const cappedAncestors = category.ancestors.slice(-2);
  return {
    id: category.id,
    name: category.name,
    ancestors: cappedAncestors.map((a) => ({
      id: a.id,
      name: a.name,
      ancestors: [],
    })),
  };
}

function transformVariantReference(
  variant: ShopifyBundleComponentVariant,
): ProductVariantReference {
  return {
    id: variant.id,
    image: transformImage(variant.image),
    product: {
      featuredImage: transformImage(variant.product.featuredImage),
      handle: variant.product.handle,
      id: variant.product.id,
      title: variant.product.title,
    },
    title: variant.title,
  };
}

function transformBundleComponent(component: {
  quantity: number;
  productVariant: ShopifyBundleComponentVariant;
}): ProductVariantComponent {
  return {
    quantity: component.quantity,
    variant: transformVariantReference(component.productVariant),
  };
}

export function transformVariant(variant: ShopifyVariant): ProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice ?? undefined,
    productHandle: variant.product.handle,
    productTitle: variant.product.title,
    selectedOptions: variant.selectedOptions,
    image: transformImage(variant.image),
    bundleParents: variant.groupedBy?.nodes.map(transformVariantReference) ?? [],
    components: variant.components?.nodes.map(transformBundleComponent) ?? [],
    requiresComponents: variant.requiresComponents ?? false,
    requiresSellingPlan: variant.product.requiresSellingPlan,
    sellingPlanAllocations: variant.sellingPlanAllocations.nodes.map((allocation) => {
      const adjustment = allocation.priceAdjustments[0];
      return {
        compareAtPrice: adjustment?.compareAtPrice ?? variant.compareAtPrice ?? variant.price,
        price: adjustment?.price ?? variant.price,
        sellingPlan: allocation.sellingPlan,
      };
    }),
  };
}

function transformSwatch(swatch: ShopifyOptionValueSwatch): OptionValueSwatch | undefined {
  if (!swatch) return undefined;
  const result: OptionValueSwatch = {};
  if (swatch.color) result.color = swatch.color;
  if (swatch.image?.previewImage?.url) result.image = swatch.image.previewImage.url;
  if (!result.color && !result.image) return undefined;
  return result;
}

function transformOption(option: ShopifyOption): ProductOption {
  return {
    id: option.id,
    name: option.name,
    values: option.optionValues.map((value): OptionValue => {
      const firstSelectableVariant = value.firstSelectableVariant
        ? transformVariant(value.firstSelectableVariant)
        : undefined;
      return {
        firstSelectableVariant,
        id: value.name,
        image: firstSelectableVariant?.image?.url,
        name: value.name,
        swatch: transformSwatch(value.swatch),
      };
    }),
  };
}

function transformProductCard(
  product: ShopifyProductCard,
  selectedOptionValue?: string,
): ProductCard {
  const defaultVariant = product.selectedOrFirstAvailableVariant;
  const colorOption = product.options?.find(
    (option) =>
      option.name.toLowerCase().includes("colo") ||
      option.optionValues.some((value) => value.swatch?.color || value.swatch?.image),
  );
  const matchedVariant = colorOption?.optionValues.find(
    (value) => value.name.toLowerCase() === selectedOptionValue?.toLowerCase(),
  )?.firstSelectableVariant;
  const cardVariant = matchedVariant ?? defaultVariant;
  const featuredImage = matchedVariant?.image ?? product.featuredImage;
  // Shopify appends CDN rendition parameters; strip them so the hover image never repeats the featured one.
  const featuredUrl = featuredImage?.url.split("?")[0];

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    featuredImage: transformImage(featuredImage),
    hoverImage: transformImage(
      product.images?.nodes?.find((image) => image.url.split("?")[0] !== featuredUrl),
    ),
    options: product.options?.map((option) => ({
      name: option.name,
      values: option.optionValues.map((value) => ({
        name: value.name,
        swatch: transformSwatch(value.swatch),
      })),
    })),
    price: product.priceRange.minVariantPrice,
    maxPrice: product.priceRange.maxVariantPrice,
    compareAtPrice: product.compareAtPriceRange.minVariantPrice,
    vendor: product.vendor || undefined,
    availableForSale: product.availableForSale,
    isGiftCard: product.isGiftCard,
    defaultVariantSelectedOptions: cardVariant?.selectedOptions ?? [],
  };
}

export function transformFilteredShopifyProductCard(
  product: ShopifyProductCard,
  selectedOptionValue?: string,
): ProductCard {
  return transformProductCard(product, selectedOptionValue);
}

export function transformShopifyProductCard(product: ShopifyProductCard): ProductCard {
  return transformProductCard(product);
}

function hasUniformPriceRange(product: ShopifyProduct): boolean {
  const { compareAtPriceRange, priceRange } = product;
  if (priceRange.minVariantPrice.amount !== priceRange.maxVariantPrice.amount) return false;
  if (priceRange.minVariantPrice.currencyCode !== priceRange.maxVariantPrice.currencyCode) {
    return false;
  }
  return compareAtPriceRange.minVariantPrice.amount === compareAtPriceRange.maxVariantPrice.amount;
}

export function transformShopifyProductDetails(product: ShopifyProduct): ProductDetails {
  const variants = product.variants
    ? flattenConnection(product.variants).map(transformVariant)
    : undefined;
  const defaultVariant = product.selectedOrFirstAvailableVariant
    ? transformVariant(product.selectedOrFirstAvailableVariant)
    : (variants?.find((v) => v.availableForSale) ?? variants?.[0]);
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    featuredImage: transformImage(product.featuredImage),
    price: product.priceRange.minVariantPrice,
    maxPrice: product.priceRange.maxVariantPrice,
    compareAtPrice: product.compareAtPriceRange.minVariantPrice,
    vendor: product.vendor || undefined,
    availableForSale: product.availableForSale,
    isGiftCard: product.isGiftCard,
    adjacentVariants: product.adjacentVariants.map(transformVariant),
    allVariantsInStock:
      !product.encodedVariantExistence ||
      product.encodedVariantExistence === product.encodedVariantAvailability,
    hasUniformPricing: hasUniformPriceRange(product),
    variantsCount: product.variantsCount?.count ?? variants?.length ?? 0,
    defaultVariant,
    defaultVariantSelectedOptions: defaultVariant?.selectedOptions ?? [],
    defaultVariantSku: product.selectedOrFirstAvailableVariant?.sku || undefined,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    encodedVariantAvailability: product.encodedVariantAvailability ?? undefined,
    encodedVariantExistence: product.encodedVariantExistence ?? undefined,
    ...extractMediaFromProduct(product),
    variants,
    variantsComplete: Boolean(
      variants?.length && product.variants?.pageInfo?.hasNextPage === false,
    ),
    options: product.options.map(transformOption),
    seo: {
      title: product.seo.title || product.title,
      description: product.seo.description || product.description,
    },
    category: transformCategory(product.category),
    updatedAt: product.updatedAt,
    priceRange: product.priceRange,
    compareAtPriceRange: product.compareAtPriceRange,
    currencyCode: product.priceRange.minVariantPrice.currencyCode,
  };
}
