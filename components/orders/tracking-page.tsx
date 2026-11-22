import Image from "next/image";
import { Fragment } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { CustomerOrder, OrderLineItem } from "@/lib/customer/types";
import { formatPrice } from "@/lib/money";
import { isOrderCapabilityAvailable } from "@/lib/orders";
import type { OrderTrackingView } from "@/lib/orders/types";

import { CancelOrderDialog } from "./cancel-order-dialog";
import { RefreshStatusButton } from "./refresh-status-button";
import { TrackingStepper } from "./tracking-stepper";

interface TrackingPageProps {
  email: string | null;
  order: CustomerOrder;
  view: OrderTrackingView;
}

export function TrackingPage({ email, order, view }: TrackingPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col desktop:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-8 px-6 pt-6 pb-8 desktop:px-10 desktop:py-10">
        <header className="grid gap-4">
          <div className="grid gap-1">
            <h1 className="type-h3 text-ink-strong">Track your order</h1>
            <p className="type-body-sm text-ink-muted">Order reference: {order.name}</p>
          </div>
          <div className="grid gap-4">
            <h2 className="type-h2 text-ink-strong">{view.statusTitle}</h2>
            <p className="type-body-sm text-ink-muted">{view.statusDetail}</p>
          </div>
        </header>

        {view.steps.length > 0 ? <TrackingStepper steps={view.steps} /> : null}

        <StageBox order={order} view={view} />

        {order.shippingAddress ? (
          <section className="grid gap-3">
            <h3 className="type-body-sm text-ink-strong">Dispatch Destination</h3>
            <address className="type-body-sm not-italic text-ink-muted">
              {order.shippingAddress.firstName || order.shippingAddress.lastName ? (
                <span className="block">
                  {[order.shippingAddress.firstName, order.shippingAddress.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </span>
              ) : null}
              {order.shippingAddress.formatted.map((line) => (
                <span className="block" key={line}>
                  {line}
                </span>
              ))}
            </address>
          </section>
        ) : null}

        <TrackingActions email={email} order={order} view={view} />
      </div>

      <aside className="flex flex-col gap-10 px-6 pb-6 desktop:w-[592px] desktop:shrink-0 desktop:border-l desktop:border-ink-strong desktop:px-20 desktop:py-10">
        <OrderItems items={order.lineItems} />
        <OrderTotals order={order} />
      </aside>
    </div>
  );
}

function StageBox({ order, view }: { order: CustomerOrder; view: OrderTrackingView }) {
  if (view.stage === "cancelled") {
    return (
      <section className="grid gap-3 border border-ink-strong p-5">
        <h3 className="type-h4 text-ink-strong">Cancellation</h3>
        <p className="type-body-sm text-ink-muted">
          This order was cancelled. Any refund follows the original payment method and your bank’s
          processing time.
        </p>
        {Number(order.totalRefunded.amount) > 0 ? (
          <p className="type-body-sm text-ink-strong">
            Refunded: {formatPrice(order.totalRefunded)}
          </p>
        ) : null}
      </section>
    );
  }

  if (view.stage === "processing") {
    return (
      <section className="grid gap-3 border border-ink-strong p-5">
        <h3 className="type-h4 text-ink-strong">Delivery information</h3>
        {view.carrier ? (
          <p className="type-body-sm text-ink-muted">Courier: {view.carrier}</p>
        ) : null}
        <p className="type-body-sm text-ink-muted">
          Your tracking link will be available once the courier collects your order.
        </p>
        <RefreshStatusButton />
      </section>
    );
  }

  if (view.stage === "packed") {
    return (
      <section className="grid gap-3 border border-ink-strong p-5">
        <h3 className="type-h4 text-ink-strong">Dispatch lock notice</h3>
        <p className="type-body-sm text-ink-muted">
          This order is locked for dispatch. The shipping address can no longer be modified and the
          order can no longer be cancelled.
        </p>
        <p className="type-body-sm text-ink-muted">
          Contact support if you need help with this order.
        </p>
      </section>
    );
  }

  if (view.stage === "dispatched") {
    return (
      <section className="grid gap-3 border border-ink-strong p-5">
        <h3 className="type-h4 text-ink-strong">Tracking details</h3>
        {view.carrier ? (
          <p className="type-body-sm text-ink-muted">Courier: {view.carrier}</p>
        ) : null}
        {view.trackingNumber ? (
          <p className="type-body-sm text-ink-muted">Tracking number: {view.trackingNumber}</p>
        ) : null}
        <p className="type-body-sm text-ink-muted">
          Your courier’s tracking page has the latest movements.
        </p>
        {view.trackingUrl ? (
          <Button
            className="h-12 w-full border-ink-strong text-ink-strong"
            render={<a href={view.trackingUrl} rel="noopener noreferrer" target="_blank" />}
            variant="outline"
          >
            Track Parcel
          </Button>
        ) : null}
      </section>
    );
  }

  return (
    <section className="grid gap-3 border border-ink-strong p-5">
      <h3 className="type-h4 text-ink-strong">Return eligibility</h3>
      <p className="type-h4 text-ink-strong">Returns are reviewed by our team</p>
      <p className="type-body-sm text-ink-muted">
        Return eligibility depends on the items in your order. Contact support and we’ll confirm
        whether this order can be returned.
      </p>
      <Link
        className="type-body-sm inline-flex min-h-9 items-center text-ink-strong hover:underline"
        href="/policies/refund-policy"
      >
        View Returns & Exchange Policy
      </Link>
      <Button
        className="h-12 w-full border-ink-strong text-ink-strong"
        render={<Link href="/pages/contact-us" />}
        variant="outline"
      >
        Contact Support
      </Button>
    </section>
  );
}

function TrackingActions({
  email,
  order,
  view,
}: {
  email: string | null;
  order: CustomerOrder;
  view: OrderTrackingView;
}) {
  const canRequestCancellation = view.cancellation.status === "available";
  const isPending = view.cancellation.status === "pending";

  return (
    <section className="grid gap-4">
      {isOrderCapabilityAvailable("invoices") ? (
        <Button className="h-12 w-full border-ink-strong text-ink-strong" variant="outline">
          Download Tax Invoice
        </Button>
      ) : null}

      {view.stage === "processing" && view.cancellation.status === "available" ? (
        <CancelOrderDialog
          amount={formatPrice(order.totalPrice)}
          email={email}
          orderId={order.id}
          orderName={order.name}
          window={view.cancellation.window}
        />
      ) : null}

      {isPending ? (
        <div className="grid gap-2 border border-ink-strong p-4">
          <h3 className="type-h4 text-ink-strong">Cancellation requested</h3>
          <p className="type-body-sm text-ink-muted">
            We’ve sent your request. Our team will email you the outcome. The order is not cancelled
            until it is approved.
          </p>
        </div>
      ) : null}

      {view.stage === "processing" ? (
        <div className="grid gap-3">
          <h3 className="type-body-sm text-ink-strong">Cancellation & address correction</h3>
          <p className="type-body-sm text-ink-muted">
            Within 24 hours, cancellations return to your original payment method. After 24 hours,
            cancellations are credited to your Account Balance wallet. Changes stop when the order
            is locked for dispatch.
          </p>
          <p className="type-body-sm text-ink-muted">
            {canRequestCancellation || isPending
              ? "Requests are reviewed by our team. To change your delivery address, contact support."
              : "This order can no longer be cancelled online. Contact support for help."}
          </p>
        </div>
      ) : null}

      {view.stage === "dispatched" ? (
        <p className="type-body-sm text-ink-muted">
          Changes stop when the order is locked for dispatch.
        </p>
      ) : null}

      {view.stage === "delivered" ? (
        <p className="type-body-sm text-ink-muted">Cancellation is unavailable after delivery.</p>
      ) : null}

      <Link
        className="type-body-sm inline-flex min-h-9 items-center text-ink-strong hover:underline"
        href="/pages/contact-us"
      >
        Need help? Contact support
      </Link>
    </section>
  );
}

function OrderItems({ items }: { items: OrderLineItem[] }) {
  return (
    <ul className="grid gap-6">
      {items.map((item, index) => (
        <li className="flex gap-6" key={`${item.title}-${String(index)}`}>
          <div className="relative aspect-[123/191] w-[123px] shrink-0 overflow-hidden border border-ink-strong bg-disabled">
            {item.image ? (
              <Image
                alt={item.image.altText}
                className="object-cover"
                fill
                sizes="100vw"
                src={item.image.url}
              />
            ) : null}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <p className="type-meta-semibold text-ink">{item.title}</p>
              {item.totalPrice ? (
                <span className="type-body-sm hidden shrink-0 text-ink-strong desktop:block">
                  {formatPrice(item.totalPrice)}
                </span>
              ) : null}
            </div>
            <OrderItemOptions item={item} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function OrderItemOptions({ item }: { item: OrderLineItem }) {
  const rows = [
    ...item.variantOptions.map((option) => ({ label: option.name, value: option.value })),
    { label: "Qty", value: String(item.quantity) },
  ];

  return (
    <dl className="flex flex-col gap-4 desktop:flex-row desktop:flex-wrap desktop:items-center desktop:gap-4">
      {rows.map((row, index) => (
        <Fragment key={`${row.label}-${row.value}`}>
          <div className="flex items-baseline gap-4 desktop:gap-1">
            <dt className="type-body-sm text-ink">{row.label}</dt>
            <dd className="type-meta-bold text-ink">{row.value}</dd>
          </div>
          {index < rows.length - 1 ? (
            <span aria-hidden className="hidden size-1 rounded-full bg-ink-strong desktop:block" />
          ) : null}
        </Fragment>
      ))}
      {item.totalPrice ? (
        <div className="flex items-baseline gap-4 desktop:hidden">
          <dt className="type-body-sm text-ink">Price</dt>
          <dd className="type-meta-bold text-ink">{formatPrice(item.totalPrice)}</dd>
        </div>
      ) : null}
    </dl>
  );
}

function OrderTotals({ order }: { order: CustomerOrder }) {
  const totalRefunded = Number(order.totalRefunded.amount);

  return (
    <dl className="grid gap-6">
      {order.subtotal ? <TotalRow label="Subtotal" money={order.subtotal} /> : null}
      {order.totalTax ? <TotalRow label="Taxes & Charges" money={order.totalTax} /> : null}
      <div className="flex items-baseline justify-between gap-4">
        <dt className="type-body text-ink">Delivery</dt>
        <dd className="type-body tabular-nums text-ink">
          {order.totalShipping && Number(order.totalShipping.amount) > 0
            ? formatPrice(order.totalShipping)
            : "Free"}
        </dd>
      </div>
      {totalRefunded > 0 ? <TotalRow label="Refunded" money={order.totalRefunded} /> : null}
      <div className="flex items-baseline justify-between gap-4">
        <dt className="type-nav text-ink-strong">TOTAL</dt>
        <dd className="type-nav tabular-nums text-ink-strong">{formatPrice(order.totalPrice)}</dd>
      </div>
    </dl>
  );
}

function TotalRow({ label, money }: { label: string; money: CustomerOrder["totalPrice"] }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="type-body text-ink">{label}</dt>
      <dd className="type-body tabular-nums text-ink">{formatPrice(money)}</dd>
    </div>
  );
}
