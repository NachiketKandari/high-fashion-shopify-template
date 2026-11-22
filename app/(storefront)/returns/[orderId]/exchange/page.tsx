import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { ReturnBreadcrumb } from "@/components/returns/return-breadcrumb";
import { ReturnExchangeForm } from "@/components/returns/return-exchange-form";
import { ReturnFlowSkeleton } from "@/components/returns/return-flow-skeleton";
import { ReturnShell } from "@/components/returns/return-shell";
import { ReturnStepper } from "@/components/returns/return-stepper";
import { ReturnSummary } from "@/components/returns/return-summary";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { requireCustomerSession } from "@/lib/auth/server";
import { formatReturnItemOptions, getOtherItemsSummary } from "@/lib/returns";
import { getExchangeProduct, getReturnContext, getReturnEstimate } from "@/lib/returns/server";
import { decodeShopifyId } from "@/lib/shopify/id/server";

export const metadata: Metadata = {
  title: "Choose your replacement",
};

export default function ReturnExchangePage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ item?: string }>;
}) {
  return (
    <Suspense fallback={<ReturnFlowSkeleton step={2} />}>
      <ReturnExchangeContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ReturnExchangeContent({
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

  const [estimate, product] = await Promise.all([
    getReturnEstimate(orderId, item.id, item.availableQuantity),
    item.productId ? getExchangeProduct(item.productId) : Promise.resolve(null),
  ]);
  const otherItems = getOtherItemsSummary(context, item.id);
  const encodedOrderId = encodeURIComponent(orderId);

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
          policyCopy="Replacement dispatch follows acceptance of the returned item. Other items in your order are unaffected."
        />
      }
    >
      <ReturnBreadcrumb orderId={orderId} />
      <h1 className="type-h2 text-ink-strong">Choose your replacement</h1>
      <p className="type-body-sm text-ink-muted">Order reference: {context.orderName}</p>
      <ReturnStepper current={2} />

      {product && product.options.length > 0 && product.variants.length > 0 ? (
        <ReturnExchangeForm context={context} item={item} product={product} />
      ) : (
        <div className="grid gap-4 border border-ink p-5">
          <p className="type-body text-ink">This item cannot be exchanged online.</p>
          <p className="type-body-sm text-ink-muted">
            Choose a return instead, or contact the concierge to discuss an alternative.
          </p>
          <Button
            render={
              <Link
                href={`/returns/${encodedOrderId}/details?item=${encodeURIComponent(item.id)}&resolution=return`}
              />
            }
            size="lg"
          >
            Choose return instead
          </Button>
          <Link
            className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink hover:underline"
            href="/pages/contact-us"
          >
            Contact concierge
          </Link>
        </div>
      )}

      <Link
        className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink hover:underline"
        href={`/returns/${encodedOrderId}`}
      >
        Back to item selection
      </Link>
    </ReturnShell>
  );
}
