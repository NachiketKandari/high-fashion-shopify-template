import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  formatOrderDate,
  humanizeStatus,
  OrderStatusBadge,
} from "@/components/account/order-display";
import { AccountPageHeader } from "@/components/account/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { CustomerOrder, OrderLineItem } from "@/lib/customer/types";
import { formatPrice } from "@/lib/money";
import type { Money } from "@/lib/money/types";
import { getNonReturnableMessage, getReturnStatusLabel } from "@/lib/returns";
import { decodeShopifyId } from "@/lib/shopify/id/server";
import { fetchCustomerOrder } from "@/lib/shopify/operations/customer/server";

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
    <>
      <AccountPageHeader title={order.name} description={formatOrderDate(order.processedAt)} />

      <div className="flex flex-wrap items-center gap-2">
        <OrderStatusBadge status={order.fulfillmentStatus} />
        {order.financialStatus ? (
          <Badge variant="outline">{humanizeStatus(order.financialStatus)}</Badge>
        ) : null}
      </div>

      <OrderReturns order={order} />

      <ul className="grid grid-cols-1 divide-y rounded-none border">
        {order.lineItems.map((item, index) => (
          <OrderLineItemRow key={index} item={item} />
        ))}
      </ul>

      <dl className="grid gap-2 rounded-none border p-4 type-body-sm">
        <SummaryRow label="Subtotal" money={order.subtotal} />
        <SummaryRow label="Shipping" money={order.totalShipping} />
        <SummaryRow label="Tax" money={order.totalTax} />
        <div className="flex items-center justify-between border-t pt-2 font-normal">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(order.totalPrice)}</dd>
        </div>
      </dl>

      {order.shippingAddress && order.shippingAddress.formatted.length > 0 ? (
        <div className="grid gap-2 rounded-none border p-4">
          <h2 className="type-body-sm font-normal">Shipping address</h2>
          <address className="type-body-sm text-muted-foreground not-italic">
            {order.shippingAddress.formatted.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          render={<a href={order.statusPageUrl} target="_blank" rel="noopener noreferrer" />}
        >
          View order status
        </Button>
      </div>
    </>
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
    <div className="grid gap-4">
      {hasReturns ? (
        <div className="grid gap-3 border border-ink p-4">
          <p className="type-body text-ink">Returns</p>
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
        </div>
      ) : null}

      {canRequest ? (
        <div className="grid gap-3 border border-ink p-4">
          <p className="type-body text-ink">
            {hasReturns ? "Return another item" : "Return window open"}
          </p>
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
        </div>
      ) : null}

      {!hasReturns && !canRequest && nonReturnableSummary ? (
        <div className="grid gap-3 border border-ink p-4">
          <p className="type-body text-ink">Returns are not available for this order</p>
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
        </div>
      ) : null}
    </div>
  );
}

function OrderLineItemRow({ item }: { item: OrderLineItem }) {
  return (
    <li className="flex items-center gap-3 p-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-none bg-muted">
        {item.image ? (
          <Image
            src={item.image.url}
            alt={item.image.altText}
            fill
            className="object-cover"
            sizes="100vw"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate type-body-sm font-normal">{item.title}</p>
        {item.variantTitle ? (
          <p className="truncate type-body-sm text-muted-foreground">{item.variantTitle}</p>
        ) : null}
        <p className="type-body-sm text-muted-foreground">× {item.quantity}</p>
      </div>
      {item.totalPrice ? (
        <span className="type-body-sm shrink-0 tabular-nums">{formatPrice(item.totalPrice)}</span>
      ) : null}
    </li>
  );
}

function SummaryRow({ label, money }: { label: string; money: Money | null }) {
  if (!money) return null;
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{formatPrice(money)}</dd>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-24 w-full rounded-none" />
      <Skeleton className="h-32 w-full rounded-none" />
    </div>
  );
}
