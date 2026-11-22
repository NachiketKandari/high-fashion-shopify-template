import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ReturnFlowSkeleton } from "@/components/returns/return-flow-skeleton";
import { ReturnItemsStep } from "@/components/returns/return-items-step";
import { requireCustomerSession } from "@/lib/auth/server";
import { getReturnContext, getReturnEstimate } from "@/lib/returns/server";
import { decodeShopifyId } from "@/lib/shopify/id/server";

export const metadata: Metadata = {
  title: "Select items to return",
};

export default function ReturnItemsPage({ params }: { params: Promise<{ orderId: string }> }) {
  return (
    <Suspense fallback={<ReturnFlowSkeleton step={1} />}>
      <ReturnItemsContent params={params} />
    </Suspense>
  );
}

async function ReturnItemsContent({ params }: { params: Promise<{ orderId: string }> }) {
  await requireCustomerSession();
  const { orderId: rawOrderId } = await params;
  if (!rawOrderId) notFound();
  const orderId = decodeShopifyId(rawOrderId);

  const context = await getReturnContext(orderId);
  if (!context) notFound();

  const initialItem = context.items[0];
  const initialEstimate = initialItem
    ? await getReturnEstimate(orderId, initialItem.id, initialItem.availableQuantity)
    : null;

  return <ReturnItemsStep context={context} initialEstimate={initialEstimate} />;
}
