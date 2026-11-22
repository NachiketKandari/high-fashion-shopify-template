import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { Price } from "@/components/product/price";
import { ReturnBreadcrumb } from "@/components/returns/return-breadcrumb";
import { ReturnFlowSkeleton } from "@/components/returns/return-flow-skeleton";
import { ReturnResolutionForm } from "@/components/returns/return-resolution-form";
import { ReturnShell } from "@/components/returns/return-shell";
import { ReturnStepper } from "@/components/returns/return-stepper";
import { ReturnSummary } from "@/components/returns/return-summary";
import { requireCustomerSession } from "@/lib/auth/server";
import { formatReturnItemOptions, getOtherItemsSummary } from "@/lib/returns";
import { getReturnContext, getReturnEstimate } from "@/lib/returns/server";
import { decodeShopifyId } from "@/lib/shopify/id/server";

export const metadata: Metadata = {
  title: "Exchange or return",
};

export default function ReturnResolutionPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ item?: string }>;
}) {
  return (
    <Suspense fallback={<ReturnFlowSkeleton step={2} />}>
      <ReturnResolutionContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ReturnResolutionContent({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ item?: string }>;
}) {
  const [{ orderId: rawOrderId }, query] = await Promise.all([params, searchParams]);
  if (!rawOrderId) notFound();
  const orderId = decodeShopifyId(rawOrderId);
  await requireCustomerSession();

  const context = await getReturnContext(orderId);
  if (!context) notFound();

  const item = context.items.find((entry) => entry.id === query.item);
  if (!item) redirect(`/returns/${encodeURIComponent(orderId)}`);

  const estimate = await getReturnEstimate(orderId, item.id, item.availableQuantity);
  const otherItems = getOtherItemsSummary(context, item.id);

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
        />
      }
    >
      <ReturnBreadcrumb orderId={orderId} />
      <h1 className="type-h2 text-ink-strong">Exchange or return?</h1>
      <p className="type-body-sm text-ink-muted">Order reference: {context.orderName}</p>
      <ReturnStepper current={2} />

      <div className="grid gap-3 border border-ink p-4">
        <p className="type-control text-ink">{item.title}</p>
        <p className="type-body-sm text-ink-muted">
          Current selection: {formatReturnItemOptions(item.options) || item.variantTitle || "—"}
        </p>
        {item.totalPrice ? (
          <p className="type-body-sm text-ink">
            Return value:{" "}
            <Price amount={item.totalPrice.amount} currencyCode={item.totalPrice.currencyCode} />
          </p>
        ) : null}
        <p className="type-body-sm text-ink">Selected item · Qty {item.availableQuantity}</p>
      </div>

      <ReturnResolutionForm context={context} estimate={estimate} item={item} />
    </ReturnShell>
  );
}
