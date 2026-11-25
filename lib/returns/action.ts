"use server";

import { refresh } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";

import { logError } from "@/lib/observability/server";
import { buildReturnCustomerNote, isIssueReason } from "@/lib/returns";
import { getExchangeProduct, getReturnContext } from "@/lib/returns/server";
import type { ReturnActionResult, ReturnEstimateResult } from "@/lib/returns/types";
import {
  calculateCustomerReturn,
  requestCustomerReturn,
} from "@/lib/shopify/operations/customer/server";

const ESTIMATE_INPUT = z.strictObject({
  lineItemId: z.string().min(1),
  orderId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const SUBMIT_INPUT = z.strictObject({
  lineItemId: z.string().min(1),
  note: z.string().max(1000).optional(),
  orderId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  reasonDefinitionId: z.string().min(1).optional(),
  reasonLabel: z.string().min(1).max(120),
  refundMethod: z.enum(["original", "wallet"]).optional(),
  replacementLabel: z.string().max(200).optional(),
  replacementVariantId: z.string().min(1).optional(),
  resolution: z.enum(["exchange", "return"]),
});

export async function estimateReturnAction(
  input: z.infer<typeof ESTIMATE_INPUT>,
): Promise<ReturnEstimateResult> {
  const parsed = ESTIMATE_INPUT.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid return request" };

  try {
    const context = await getReturnContext(parsed.data.orderId);
    const item = context?.items.find((entry) => entry.id === parsed.data.lineItemId);
    if (!item || parsed.data.quantity > item.availableQuantity) {
      return { success: false, error: "This item is not available to return" };
    }

    const estimate = await calculateCustomerReturn(parsed.data.orderId, [
      { lineItemId: parsed.data.lineItemId, quantity: parsed.data.quantity },
    ]);
    if (!estimate) return { success: false, error: "Could not calculate the return value" };

    return { success: true, estimate };
  } catch (error) {
    unstable_rethrow(error);
    logError("returns.action.failed", error, { operation: "Failed to calculate return estimate" });
    return { success: false, error: "Could not calculate the return value" };
  }
}

export async function submitReturnAction(
  input: z.infer<typeof SUBMIT_INPUT>,
): Promise<ReturnActionResult> {
  const parsed = SUBMIT_INPUT.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid return request" };

  try {
    const context = await getReturnContext(parsed.data.orderId);
    const item = context?.items.find((entry) => entry.id === parsed.data.lineItemId);
    if (!item || parsed.data.quantity > item.availableQuantity) {
      return { success: false, error: "This item is not available to return" };
    }

    let replacementLabel: string | undefined;
    if (parsed.data.resolution === "exchange") {
      if (!parsed.data.replacementVariantId || !item.productId) {
        return { success: false, error: "Choose a replacement before continuing" };
      }
      const product = await getExchangeProduct(item.productId);
      const variant = product?.variants.find(
        (entry) => entry.id === parsed.data.replacementVariantId,
      );
      if (!variant?.availableForSale) {
        return { success: false, error: "That replacement is no longer available" };
      }
      replacementLabel = variant.selectedOptions.map((option) => option.value).join(" / ");
    }

    const refundMethod =
      parsed.data.resolution === "return" ? (parsed.data.refundMethod ?? "wallet") : undefined;
    if (refundMethod === "original" && !isIssueReason(parsed.data.reasonLabel)) {
      return {
        fieldErrors: {
          refundMethod: "Original payment is available for damaged, faulty or wrong items.",
        },
        success: false,
      };
    }

    const reasonDefinitionId = item.reasons.some(
      (reason) => reason.id === parsed.data.reasonDefinitionId,
    )
      ? parsed.data.reasonDefinitionId
      : undefined;

    const result = await requestCustomerReturn(parsed.data.orderId, [
      {
        customerNote: buildReturnCustomerNote({
          note: parsed.data.note,
          reasonLabel: parsed.data.reasonLabel,
          refundMethod,
          replacementLabel,
          resolution: parsed.data.resolution,
        }),
        lineItemId: parsed.data.lineItemId,
        quantity: parsed.data.quantity,
        returnReasonDefinitionId: reasonDefinitionId,
      },
    ]);

    if (result.errors.length > 0) {
      const featureDisabled = result.errors.some((error) => error.code === "FEATURE_NOT_ENABLED");
      return {
        error: featureDisabled
          ? "Return requests are not available for this order yet. Contact the concierge for help."
          : result.errors[0].message,
        fieldErrors: Object.fromEntries(
          result.errors
            .flatMap((error) => {
              const field = error.field?.at(-1);
              return field ? [[field, error.message] as const] : [];
            })
            .reverse(),
        ),
        success: false,
      };
    }

    if (!result.request) {
      return {
        error:
          "We couldn't confirm this request. Check your orders before trying again or contact the concierge.",
        success: false,
      };
    }

    refresh();

    return { returnId: result.request.id, success: true };
  } catch (error) {
    unstable_rethrow(error);
    logError("returns.action.failed", error, { operation: "Failed to submit return request" });
    return {
      error:
        "We couldn't confirm this request. Check your orders before trying again or contact the concierge.",
      success: false,
    };
  }
}
