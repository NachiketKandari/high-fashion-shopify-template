import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ReturnFlowSkeleton } from "@/components/returns/return-flow-skeleton";
import { ReturnRequestView } from "@/components/returns/return-request-view";
import { requireCustomerSession } from "@/lib/auth/server";
import { getReturnRequest } from "@/lib/returns/server";
import { decodeShopifyId } from "@/lib/shopify/id/server";

export const metadata: Metadata = {
  title: "Return status",
};

export default function ReturnRequestPage({
  params,
}: {
  params: Promise<{ orderId: string; returnId: string }>;
}) {
  return (
    <Suspense fallback={<ReturnFlowSkeleton step={4} />}>
      <ReturnRequestContent params={params} />
    </Suspense>
  );
}

async function ReturnRequestContent({
  params,
}: {
  params: Promise<{ orderId: string; returnId: string }>;
}) {
  const { orderId: rawOrderId, returnId: rawReturnId } = await params;
  if (!rawOrderId || !rawReturnId) notFound();
  const orderId = decodeShopifyId(rawOrderId);
  const returnId = decodeShopifyId(rawReturnId);
  await requireCustomerSession();

  const detail = await getReturnRequest(orderId, returnId);
  if (!detail) notFound();

  return <ReturnRequestView detail={detail} />;
}
