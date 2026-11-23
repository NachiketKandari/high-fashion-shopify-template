import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { ReturnBreadcrumb } from "@/components/returns/return-breadcrumb";
import { ReturnDetailsForm } from "@/components/returns/return-details-form";
import { ReturnFlowSkeleton } from "@/components/returns/return-flow-skeleton";
import { ReturnShell } from "@/components/returns/return-shell";
import { ReturnStepper } from "@/components/returns/return-stepper";
import { ReturnSummary } from "@/components/returns/return-summary";
import { requireCustomerSession } from "@/lib/auth/server";
import { formatReturnItemOptions, getOtherItemsSummary } from "@/lib/returns";
import { getReturnContext, getReturnEstimate } from "@/lib/returns/server";
import { decodeShopifyId } from "@/lib/shopify/id/server";

export const metadata: Metadata = {
  title: "Reason & refund method",
};

interface ReturnDetailsQuery {
  item?: string;
  reason?: string;
  reasonId?: string;
  replacementLabel?: string;
  replacementVariantId?: string;
  resolution?: string;
}

export default function ReturnDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<ReturnDetailsQuery>;
}) {
  return (
    <Suspense fallback={<ReturnFlowSkeleton step={3} />}>
      <ReturnDetailsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ReturnDetailsContent({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<ReturnDetailsQuery>;
}) {
  const [{ orderId: rawOrderId }, query] = await Promise.all([params, searchParams]);
  if (!rawOrderId) notFound();
  const orderId = decodeShopifyId(rawOrderId);
  await requireCustomerSession();

  const context = await getReturnContext(orderId);
  if (!context) notFound();

  const item = context.items.find((entry) => entry.id === query.item);
  if (!item) redirect(`/returns/${encodeURIComponent(orderId)}`);

  const resolution = query.resolution === "exchange" ? "exchange" : "return";
  const encodedOrderId = encodeURIComponent(orderId);
  if (resolution === "exchange" && (!query.replacementVariantId || !query.replacementLabel)) {
    redirect(`/returns/${encodedOrderId}/exchange?item=${encodeURIComponent(item.id)}`);
  }

  const estimate = await getReturnEstimate(orderId, item.id, item.availableQuantity);
  const otherItems = getOtherItemsSummary(context, item.id);
  const replacement =
    resolution === "exchange" && query.replacementVariantId && query.replacementLabel
      ? { id: query.replacementVariantId, label: query.replacementLabel }
      : null;

  return (
    <ReturnShell
      summary={
        <ReturnSummary
          estimate={estimate}
          item={{
            options: formatReturnItemOptions(item.options),
            quantity: item.availableQuantity,
            title: item.title,
          }}
          orderName={context.orderName}
          otherItems={otherItems}
          policyCopy={
            resolution === "exchange"
              ? "Replacement dispatch follows acceptance of the returned item. Other items in your order are unaffected."
              : undefined
          }
        />
      }
    >
      <ReturnBreadcrumb orderId={orderId} />
      <h1 className="type-h2 text-ink-strong">
        {resolution === "exchange" ? "Reason & pickup" : "Reason & refund method"}
      </h1>
      <p className="type-body-sm text-ink-muted">Order reference: {context.orderName}</p>
      <ReturnStepper current={3} />

      <ReturnDetailsForm
        context={context}
        estimate={estimate}
        initialReasonId={query.reasonId}
        initialReasonLabel={query.reason}
        item={item}
        replacement={replacement}
        resolution={resolution}
      />
    </ReturnShell>
  );
}
