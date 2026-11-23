import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ConfirmationView } from "@/components/checkout/confirmation-view";
import { getConfirmationPolicyState } from "@/lib/checkout/confirmation";
import {
  getPreviewConfirmationOrder,
  type PreviewConfirmationState,
} from "@/lib/checkout/confirmation-fixture";
import { readConfirmationToken } from "@/lib/checkout/token/server";
import { fetchConfirmationOrder } from "@/lib/shopify/operations/order/server";

const PREVIEW_STATES: Record<string, PreviewConfirmationState> = {
  "preview-active": "active",
  "preview-expired": "expired",
  "preview-guest": "guest",
  "preview-pending": "pending",
};

interface ConfirmationContentProps {
  params: Promise<{ token: string }>;
}

export async function ConfirmationContent({ params }: ConfirmationContentProps) {
  await connection();
  const { token } = await params;

  const previewState = process.env.NODE_ENV !== "production" ? PREVIEW_STATES[token] : undefined;
  const order = previewState
    ? getPreviewConfirmationOrder(previewState)
    : await (async () => {
        const orderId = readConfirmationToken(token);
        if (!orderId) return null;
        return fetchConfirmationOrder(orderId);
      })();

  if (!order) notFound();

  return (
    <ConfirmationView
      order={order}
      policyState={getConfirmationPolicyState(order)}
      returnTo={`/checkout/confirmation/${token}`}
    />
  );
}
