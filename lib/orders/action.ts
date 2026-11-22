"use server";

import { z } from "zod";

import type {
  OrderCancellationResult,
  OrderLookupFieldErrors,
  OrderLookupResult,
} from "@/lib/orders/types";
import {
  fetchCustomerOrder,
  requestCustomerOrderCancellation,
} from "@/lib/shopify/operations/customer/server";

const cancellationSchema = z.strictObject({
  orderId: z.string().trim().min(1).max(255),
});

const lookupSchema = z.strictObject({
  email: z.email().max(254),
  orderReference: z.string().trim().min(1).max(64),
});

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function cancelOrderAction(input: {
  orderId: string;
}): Promise<OrderCancellationResult> {
  const parsed = cancellationSchema.safeParse(input);
  if (!parsed.success) return { status: "unavailable" };

  const order = await fetchCustomerOrder(parsed.data.orderId);
  if (!order || order.cancelledAt) return { status: "unavailable" };
  if (order.requestedEdits.some((request) => request.status === "REQUESTED")) {
    return { status: "unavailable" };
  }
  if (!order.hasEditableLineItems || order.editableLineItems.length === 0) {
    return { status: "unavailable" };
  }

  const result = await requestCustomerOrderCancellation(order.id, order.editableLineItems);
  if (result.errors.length > 0) {
    return { status: "error", message: result.errors[0].message };
  }
  if (!result.requestId) return { status: "unavailable" };

  return { status: "requested" };
}

export async function lookupOrderAction(
  _previous: OrderLookupResult | null,
  formData: FormData,
): Promise<OrderLookupResult> {
  const parsed = lookupSchema.safeParse({
    email: formValue(formData, "email"),
    orderReference: formValue(formData, "orderReference"),
  });

  if (!parsed.success) {
    const fieldErrors: OrderLookupFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "email" || field === "orderReference") {
        fieldErrors[field] ??=
          field === "email" ? "Enter a valid email address." : "Enter your order reference.";
      }
    }
    return { fieldErrors, status: "invalid" };
  }

  return { status: "unavailable" };
}
