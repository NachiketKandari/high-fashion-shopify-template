import { cache } from "react";

import { getProductWithVariantsById } from "@/lib/product/server";
import type {
  ExchangeProduct,
  ReturnContext,
  ReturnEstimate,
  ReturnRequestDetail,
} from "@/lib/returns/types";
import {
  calculateCustomerReturn,
  fetchCustomerOrderReturnContext,
  fetchCustomerOrderReturnDetail,
} from "@/lib/shopify/operations/customer/server";

export const getReturnContext = cache(async (orderId: string): Promise<ReturnContext | null> =>
  fetchCustomerOrderReturnContext(orderId),
);

export const getReturnEstimate = cache(
  async (orderId: string, lineItemId: string, quantity: number): Promise<ReturnEstimate | null> =>
    calculateCustomerReturn(orderId, [{ lineItemId, quantity }]),
);

export const getReturnRequest = cache(
  async (orderId: string, returnId: string): Promise<ReturnRequestDetail | null> =>
    fetchCustomerOrderReturnDetail(orderId, returnId),
);

export const getExchangeProduct = cache(
  async (productId: string): Promise<ExchangeProduct | null> => {
    const product = await getProductWithVariantsById({ id: productId });
    if (!product?.variants) return null;

    return {
      options: product.options.map((option) => ({
        name: option.name,
        values: option.values.map((value) => value.name),
      })),
      title: product.title,
      variants: product.variants.map((variant) => ({
        availableForSale: variant.availableForSale,
        id: variant.id,
        selectedOptions: variant.selectedOptions.map((option) => ({
          name: option.name,
          value: option.value,
        })),
        title: variant.title,
      })),
    };
  },
);
