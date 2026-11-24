"use server";

import { z } from "zod";

import { isCustomerLoggedIn } from "@/lib/auth/server";
import { toProductFormInput } from "@/lib/product";
import { getProduct } from "@/lib/product/server";
import { isSizeOption } from "@/lib/product/sizes";
import type {
  ProductDetails,
  ProductVariant,
  QuickShopProduct,
  SelectedOption,
} from "@/lib/product/types";
import { fetchProductVariant, fetchProductsByIds } from "@/lib/shopify/operations/products/server";
import type { WishlistRefreshResult } from "@/lib/wishlist/types";

const PRODUCT_ID = z
  .string()
  .max(128)
  .regex(/^gid:\/\/shopify\/Product\/\d+$/);

const REFRESH_INPUT = z.strictObject({
  ids: z.array(PRODUCT_ID).max(50),
});

const SELECTED_OPTION = z.strictObject({
  name: z.string().min(1).max(100),
  value: z.string().min(1).max(200),
});

const LOAD_INPUT = z.strictObject({
  handle: z.string().min(1).max(255),
  selectedOptions: z.array(SELECTED_OPTION).max(10),
});

export async function refreshWishlistProductsAction(ids: string[]): Promise<WishlistRefreshResult> {
  const parsed = REFRESH_INPUT.safeParse({ ids });
  if (!parsed.success) return { products: [], requestedIds: [], success: false };
  const requestedIds = parsed.data.ids;
  if (!(await isCustomerLoggedIn())) return { products: [], requestedIds, success: false };
  try {
    const products = await fetchProductsByIds({ ids: requestedIds });
    return { products, requestedIds, success: true };
  } catch {
    return { products: [], requestedIds, success: false };
  }
}

// Saved size may be gone while the colour is not; resolve the colour's first available variant instead.
export async function loadWishlistProductAction(
  handle: string,
  selectedOptions: SelectedOption[],
): Promise<QuickShopProduct | null> {
  const parsed = LOAD_INPUT.safeParse({ handle, selectedOptions });
  if (!parsed.success) return null;

  const product = await getProduct({ handle: parsed.data.handle });
  if (!product || product.isGiftCard) return null;

  const requested = canonicalizeOptions(product, parsed.data.selectedOptions);
  if (!requested) return null;

  const exact =
    requested.length === product.options.length
      ? await fetchProductVariant({ handle: product.handle, selectedOptions: requested })
      : undefined;
  const exactMatches =
    exact !== undefined &&
    requested.every(({ name, value }) =>
      exact.selectedOptions.some((option) => option.name === name && option.value === value),
    );

  let variant = exactMatches ? exact : product.defaultVariant;
  if (!exactMatches) {
    const colour = requested.find(({ name }) => !isSizeOption(name));
    if (colour) {
      const option = product.options.find(({ name }) => name === colour.name);
      const value = option?.values.find(({ name }) => name === colour.value);
      if (!value?.firstSelectableVariant) return null;
      variant = value.firstSelectableVariant;
    }
  }

  return toWishlistProduct(product, variant);
}

export async function resolveWishlistSelectionAction(
  handle: string,
  selectedOptions: SelectedOption[],
): Promise<QuickShopProduct | null> {
  const parsed = LOAD_INPUT.safeParse({ handle, selectedOptions });
  if (!parsed.success) return null;

  const product = await getProduct({ handle: parsed.data.handle });
  if (!product || product.isGiftCard) return null;

  const requested = canonicalizeOptions(product, parsed.data.selectedOptions);
  if (!requested || requested.length !== product.options.length) return null;

  const variant = await fetchProductVariant({ handle: product.handle, selectedOptions: requested });
  if (
    !variant ||
    !requested.every(({ name, value }) =>
      variant.selectedOptions.some((option) => option.name === name && option.value === value),
    )
  ) {
    return null;
  }

  return toWishlistProduct(product, variant);
}

function toWishlistProduct(
  product: ProductDetails,
  variant: ProductVariant | undefined,
): QuickShopProduct {
  return {
    availableForSale: product.availableForSale,
    form: toProductFormInput(product, variant),
    hasOptions: product.options.some(({ values }) => values.length > 1),
    image: product.featuredImage?.url ?? null,
    title: product.title,
  };
}

function canonicalizeOptions(
  product: ProductDetails,
  requested: SelectedOption[],
): SelectedOption[] | undefined {
  const selected = new Map<string, string>();
  for (const { name, value } of requested) {
    const option = product.options.find(
      (candidate) => candidate.name.toLowerCase() === name.toLowerCase(),
    );
    if (!option) return undefined;
    const match = option.values.find(
      (candidate) => candidate.name.toLowerCase() === value.toLowerCase(),
    );
    if (!match) return undefined;
    selected.set(option.name, match.name);
  }
  return [...selected].map(([name, value]) => ({ name, value }));
}
