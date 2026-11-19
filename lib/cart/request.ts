import { createCartServerHandlers, type StorefrontClient } from "@shopify/hydrogen";

import type { getHydrogenCustomerSession } from "@/lib/auth/request";
import { shopConfig } from "@/lib/config";
import { CART_FRAGMENT } from "@/lib/shopify/fragments/cart";
import {
  fetchCartBuyerIdentity,
  updateCartBuyerIdentity,
} from "@/lib/shopify/operations/cart/server";

export const cartHandlers = createCartServerHandlers({ fragment: CART_FRAGMENT });

export function createCustomerCartHandlers(
  customerSession: Awaited<ReturnType<typeof getHydrogenCustomerSession>>,
) {
  return createCartServerHandlers({
    customerSession,
    fragment: CART_FRAGMENT,
  });
}

// A cart keeps the buyer country it was created with, so availability is evaluated in that market.
export async function syncCartBuyerIdentity(
  storefrontClient: StorefrontClient,
  cartId: string,
): Promise<void> {
  try {
    const countryCode = shopConfig.localization.country;
    const buyerIdentity = await fetchCartBuyerIdentity(storefrontClient, cartId);
    if (!buyerIdentity || buyerIdentity.countryCode === countryCode) return;

    const error = await updateCartBuyerIdentity(storefrontClient, cartId, countryCode);
    if (error) console.error("Cart buyer identity sync failed", error);
  } catch (error) {
    console.error("Cart buyer identity sync failed", error);
  }
}
