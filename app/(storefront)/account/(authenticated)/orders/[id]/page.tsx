import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AccountCard } from "@/components/account/card";
import { AccountPageHeader } from "@/components/account/page-header";
import { ScrollToHash } from "@/components/account/scroll-to-hash";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatOrderDate, formatOrderStatus } from "@/lib/customer";
import type { CustomerOrder, OrderLineItem } from "@/lib/customer/types";
import { formatPrice } from "@/lib/money";
import type { Money } from "@/lib/money/types";
import { getNonReturnableMessage, getReturnStatusLabel } from "@/lib/returns";
import { decodeShopifyId } from "@/lib/shopify/id/server";
import { fetchCustomerOrder } from "@/lib/shopify/operations/customer/server";

export const metadata: Metadata = {
  title: "Order",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}

async function OrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) notFound();
  const order = await fetchCustomerOrder(decodeShopifyId(id));
  if (!order) notFound();

  return (
    <div className="grid gap-6">
      <AccountPageHeader
        breadcrumb="My orders"
        description={formatOrderDate(order.processedAt)}
        title={`Order ${order.name}`}
      />

      <p className="type-body-sm text-ink">{formatOrderStatus(order.fulfillmentStatus)}</p>

      <OrderReturns order={order} />

      <section className="grid gap-4">
        <h2 className="type-h4 text-ink">Items</h2>
        <ul className="divide-y divide-rule border border-rule">
          {order.lineItems.map((item, index) => (
            <OrderLineItemRow item={item} key={index} />
          ))}
        </ul>
      </section>

      <AccountCard className="grid gap-3">
        <SummaryRow label="Subtotal" money={order.subtotal} />
        <SummaryRow label="Shipping" money={order.totalShipping} />
        <SummaryRow label="Tax" money={order.totalTax} />
        <div className="flex items-center justify-between gap-4 border-t border-rule pt-3">
          <span className="type-h4 text-ink">Total</span>
          <span className="type-h4 text-ink tabular-nums">{formatPrice(order.totalPrice)}</span>
        </div>
      </AccountCard>

      {order.shippingAddress && order.shippingAddress.formatted.length > 0 ? (
        <AccountCard className="grid gap-4">
          <h2 className="type-h4 text-ink">Shipping address</h2>
          <address className="type-body-sm grid gap-1 text-ink-muted not-italic">
            {order.shippingAddress.formatted.map((line, index) => (
              <span key={index}>{line}</span>
            ))}
          </address>
        </AccountCard>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          render={<a href={order.statusPageUrl} rel="noreferrer" target="_blank" />}
          variant="outline"
        >
          Track order
        </Button>
        <Button render={<Link href="/account/orders" />} variant="ghost">
          Back to orders
        </Button>
      </div>
      <ScrollToHash />
    </div>
  );
}

function OrderReturns({ order }: { order: CustomerOrder }) {
  const encodedOrderId = encodeURIComponent(order.id);
  const hasReturns = order.returns.length > 0;
  const canRequest = order.returnableLineItemCount > 0;
  const nonReturnableSummary = order.nonReturnableSummary;
  const nonReturnableMessage = nonReturnableSummary
    ? getNonReturnableMessage(nonReturnableSummary.reasons)
    : null;

  if (!hasReturns && !canRequest && !nonReturnableSummary) return null;

  return (
    <section className="grid scroll-mt-24 gap-4" id="return">
      {hasReturns ? (
        <AccountCard className="grid gap-3">
          <h2 className="type-h4 text-ink">Returns</h2>
          <ul className="grid gap-2">
            {order.returns.map((request) => (
              <li className="flex flex-wrap items-center justify-between gap-2" key={request.id}>
                <span className="type-body-sm">
                  {request.name} · {getReturnStatusLabel(request.status)}
                </span>
                <Link
                  className="type-body-sm focus-ring inline-flex min-h-9 items-center text-ink underline underline-offset-4"
                  href={`/returns/${encodedOrderId}/request/${encodeURIComponent(request.id)}`}
                >
                  View return
                </Link>
              </li>
            ))}
          </ul>
        </AccountCard>
      ) : null}

      {canRequest ? (
        <AccountCard className="grid gap-3">
          <h2 className="type-h4 text-ink">
            {hasReturns ? "Return another item" : "Return window open"}
          </h2>
          <p className="type-body-sm text-ink-muted">
            You can request a return while this order is within the return window. Eligibility is
            subject to the Returns &amp; Exchange policy.
          </p>
          <Button
            className="w-full"
            render={<Link href={`/returns/${encodedOrderId}`} />}
            size="lg"
          >
            {hasReturns ? "Request another return" : "Request return"}
          </Button>
          <Link
            className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline underline-offset-4"
            href="/pages/returns-exchanges"
          >
            View Returns &amp; Exchange Policy
          </Link>
        </AccountCard>
      ) : null}

      {!hasReturns && !canRequest && nonReturnableSummary ? (
        <AccountCard className="grid gap-3">
          <h2 className="type-h4 text-ink">Returns are not available for this order</h2>
          <p className="type-body-sm text-ink-muted">
            {nonReturnableMessage ??
              "This order is not eligible for return under the current policy."}
          </p>
          <Link
            className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline underline-offset-4"
            href="/pages/returns-exchanges"
          >
            View Returns &amp; Exchange Policy
          </Link>
        </AccountCard>
      ) : null}
    </section>
  );
}

function OrderLineItemRow({ item }: { item: OrderLineItem }) {
  return (
    <li className="flex items-center gap-4 p-4">
      {item.image ? (
        <div className="relative size-16 shrink-0 overflow-hidden bg-surface">
          <Image
            alt={item.image.altText}
            className="object-cover"
            fill
            sizes="100vw"
            src={item.image.url}
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="type-body-sm text-ink">{item.title}</p>
        {item.variantTitle ? (
          <p className="type-body-sm text-ink-muted">{item.variantTitle}</p>
        ) : null}
        <p className="type-body-sm text-ink-muted">Qty {item.quantity}</p>
      </div>
      {item.totalPrice ? (
        <span className="type-body-sm shrink-0 text-ink tabular-nums">
          {formatPrice(item.totalPrice)}
        </span>
      ) : null}
    </li>
  );
}

function SummaryRow({ label, money }: { label: string; money: Money | null }) {
  if (!money) return null;
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="type-body-sm text-ink-muted">{label}</span>
      <span className="type-body-sm text-ink tabular-nums">{formatPrice(money)}</span>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-6">
      <div className="grid gap-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-64 w-full rounded-none" />
      <Skeleton className="h-32 w-full rounded-none" />
    </div>
  );
}
