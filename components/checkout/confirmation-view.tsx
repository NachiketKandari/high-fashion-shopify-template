import { ArrowUpRightIcon } from "lucide-react";
import Image from "next/image";

import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import {
  buildSupportHref,
  formatPolicyDeadline,
  getCourierLabel,
  getEstimatedDispatchLabel,
  getPaymentStatusCopy,
} from "@/lib/checkout/confirmation";
import type {
  ConfirmationLineItem,
  ConfirmationOrder,
  ConfirmationPolicyState,
} from "@/lib/checkout/types";
import { formatPrice } from "@/lib/money";

import { ConfirmationActions } from "./confirmation-actions";
import { StatusRefreshButton } from "./status-refresh-button";

interface ConfirmationViewProps {
  order: ConfirmationOrder;
  policyState: ConfirmationPolicyState;
  returnTo: string;
}

export function ConfirmationView({ order, policyState, returnTo }: ConfirmationViewProps) {
  const isPending = policyState === "pending";
  const statusCopy = getPaymentStatusCopy(order);
  const firstName = order.shippingAddress?.name?.split(" ")[0];
  const trackingHref = order.tracking?.url ?? order.statusPageUrl;
  const invoiceHref = buildSupportHref(order, "Tax invoice request");

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <div className="flex flex-col gap-8 px-6 py-10 desktop:grid desktop:grid-cols-[minmax(0,1fr)_592px] desktop:items-stretch desktop:gap-0 desktop:p-0">
        <section
          aria-labelledby="confirmation-heading"
          className="order-1 grid gap-8 p-0 desktop:col-start-1 desktop:row-start-1 desktop:border desktop:border-ink-strong desktop:p-10"
        >
          <div className="grid gap-4">
            <h1 className="type-h3 text-ink-strong" id="confirmation-heading">
              {statusCopy.title}
            </h1>
            <p className="type-meta text-ink-strong">
              {isPending
                ? statusCopy.body
                : `Thank you${firstName ? `, ${firstName}` : ""}. Your order is confirmed and will be prepared for dispatch.`}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 desktop:flex desktop:flex-wrap desktop:gap-x-20 desktop:gap-y-4">
            <StatusCell label="Order Reference" value={order.name} />
            <StatusCell
              label="Estimated Dispatch"
              value={isPending ? "After confirmation" : getEstimatedDispatchLabel(order)}
            />
            <StatusCell
              label="Courier Carrier"
              value={isPending ? "Not assigned yet" : getCourierLabel(order)}
            />
            <StatusCell label="Receipt Dispatch" value={order.email ?? "Sent to your email"} />
          </dl>

          <div className="grid gap-4">
            <div className="grid gap-4 tablet:flex tablet:items-center">
              {isPending ? (
                <Button
                  className="h-10.5 w-full border-ink-strong tablet:w-auto"
                  disabled
                  variant="outline"
                >
                  Invoice after confirmation
                </Button>
              ) : (
                <Button
                  className="h-10.5 w-full border-ink-strong tablet:w-auto"
                  render={<a href={invoiceHref} />}
                  variant="outline"
                >
                  Request Tax Invoice
                </Button>
              )}

              {isPending ? (
                <StatusRefreshButton />
              ) : (
                <Button
                  className="h-10.5 w-full bg-ink-strong hover:bg-ink-strong/80 tablet:w-auto"
                  render={<a href={trackingHref} rel="noopener noreferrer" target="_blank" />}
                >
                  {order.tracking ? "Track Live Courier Progress" : "Track Order"}
                  <ArrowUpRightIcon aria-hidden="true" className="size-3.5" strokeWidth={1.25} />
                </Button>
              )}
            </div>

            {isPending ? (
              <p className="type-meta text-ink-muted">
                Your invoice is available once the payment is confirmed.{" "}
                <a
                  className="focus-ring inline-flex min-h-9 items-center underline underline-offset-4"
                  href={buildSupportHref(order, "Payment status enquiry")}
                >
                  Contact support
                </a>
                .
              </p>
            ) : null}
          </div>
        </section>

        {isPending ? (
          <PendingNotice
            className="order-2 desktop:col-start-1 desktop:row-start-2"
            order={order}
          />
        ) : null}

        {!isPending && !order.hasCustomerAccount ? (
          <GuestActivation
            className="order-2 desktop:col-start-1 desktop:row-start-2"
            email={order.email}
            returnTo={returnTo}
          />
        ) : null}

        <section
          aria-label="Order summary"
          className="order-3 desktop:col-start-2 desktop:row-span-4 desktop:row-start-1 desktop:border desktop:border-l-0 desktop:border-ink-strong desktop:px-20 desktop:py-10"
        >
          <ul className="grid gap-8">
            {order.lineItems.map((item) => (
              <ConfirmationItem item={item} key={item.id} />
            ))}
          </ul>

          <dl className="mt-8 grid gap-6">
            {order.subtotal ? <TotalRow label="Subtotal" money={order.subtotal} /> : null}
            {order.discountCodes.length > 0 ? (
              <TotalRow label="Promo code" value={order.discountCodes.join(", ")} />
            ) : null}
            {order.tax ? <TotalRow label="Taxes & Charges" money={order.tax} /> : null}
            <TotalRow
              label="Delivery"
              money={order.shipping && Number(order.shipping.amount) > 0 ? order.shipping : null}
              value="Free"
            />
            <div className="flex items-baseline justify-between gap-8">
              <dt className="type-tab-active text-ink-strong">TOTAL</dt>
              <dd>
                <Price
                  amount={order.total.amount}
                  className="type-tab-active text-ink-strong"
                  currencyCode={order.total.currencyCode}
                />
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="dispatch-heading"
          className="order-4 grid gap-10 border-y border-ink-strong py-6 desktop:col-start-1 desktop:row-start-3 desktop:items-center desktop:border-t-0 desktop:border-b-0 desktop:border-x desktop:px-10 desktop:py-10"
        >
          <div className="flex flex-col gap-4 desktop:flex-row desktop:items-center desktop:justify-between desktop:gap-10">
            <div className="grid gap-4 desktop:max-w-[453px]">
              <h2 className="type-meta text-ink-strong" id="dispatch-heading">
                Dispatch Destination
              </h2>
              {order.shippingAddress ? (
                <address className="grid gap-4 type-meta text-ink-muted not-italic">
                  {order.shippingAddress.name ? <span>{order.shippingAddress.name}</span> : null}
                  <span>
                    {order.shippingAddress.lines.map((line, index) => (
                      <span className="block" key={index}>
                        {line}
                      </span>
                    ))}
                  </span>
                </address>
              ) : (
                <p className="type-meta text-ink-muted">
                  Your delivery details are confirmed in your order email.
                </p>
              )}
            </div>

            {isPending ? (
              <p className="type-meta text-ink-strong">Updates after confirmation</p>
            ) : (
              <div className="mt-6 desktop:mt-0">
                <ConfirmationActions
                  address={order.shippingAddress}
                  orderName={order.name}
                  policyState={policyState}
                  total={new Intl.NumberFormat("en-IN", {
                    currency: order.total.currencyCode,
                    style: "currency",
                  }).format(Number(order.total.amount))}
                />
              </div>
            )}
          </div>
        </section>

        {!isPending ? (
          <section className="order-5 desktop:col-start-1 desktop:row-start-4 desktop:border desktop:border-t-0 desktop:border-ink-strong desktop:p-10">
            {policyState === "expired" ? (
              <div className="grid gap-4 desktop:max-w-[453px]">
                <p className="type-meta text-ink-muted">24-hour correction window closed</p>
                <h2 className="type-h3 text-ink-strong">
                  Cancellations credited to Account Balance wallet
                </h2>
                <p className="type-meta text-ink-muted">
                  Your original payment-method refund window has ended. If you cancel this order,{" "}
                  <Price amount={order.total.amount} currencyCode={order.total.currencyCode} /> will
                  be credited to your Account Balance wallet for a future purchase.
                </p>
                <p className="type-meta text-ink-muted">
                  Apartment and street-number corrections are no longer available online.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 desktop:max-w-[453px]">
                <h2 className="type-meta text-ink-strong">
                  Complimentary Cancellation &amp; Address Correction
                </h2>
                <p className="type-meta text-ink-muted">
                  You may request a shipping address correction or cancel for a full refund to your
                  original payment method until {formatPolicyDeadline(order)}. After 24 hours,
                  cancellations will be credited to your Account Balance.
                </p>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}

function StatusCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid content-center gap-1">
      <dt className="type-meta text-ink-muted">{label}</dt>
      <dd className="type-meta text-ink-strong">{value}</dd>
    </div>
  );
}

function ConfirmationItem({ item }: { item: ConfirmationLineItem }) {
  return (
    <li className="flex gap-6">
      <div className="relative h-[191px] w-[123px] shrink-0 overflow-hidden border border-ink-strong bg-disabled">
        {item.image ? (
          <Image
            alt={item.image.altText || item.title}
            className="object-cover"
            fill
            sizes="100vw"
            src={item.image.url}
          />
        ) : (
          <ImagePlaceholder className="size-full bg-disabled" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <p className="type-meta-semibold text-ink">{item.title}</p>
          {item.total ? (
            <Price
              amount={item.total.amount}
              className="type-meta shrink-0 text-ink"
              currencyCode={item.total.currencyCode}
            />
          ) : null}
        </div>

        <dl className="grid gap-4">
          {item.options.map((option) => (
            <div className="flex gap-4" key={option.name}>
              <dt className="type-meta text-ink">{option.name}</dt>
              <dd className="type-meta-bold text-ink">{option.value}</dd>
            </div>
          ))}
          <div className="flex gap-4">
            <dt className="type-meta text-ink">Qty</dt>
            <dd className="type-meta-bold text-ink">{item.quantity}</dd>
          </div>
        </dl>
      </div>
    </li>
  );
}

function TotalRow({
  label,
  money,
  value,
}: {
  label: string;
  money?: { amount: string; currencyCode: string } | null;
  value?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-8">
      <dt className="type-h4 text-ink-strong">{label}</dt>
      <dd className="type-h4 text-ink-strong">
        {money ? <Price amount={money.amount} currencyCode={money.currencyCode} /> : value}
      </dd>
    </div>
  );
}

function PendingNotice({ className, order }: { className?: string; order: ConfirmationOrder }) {
  return (
    <section className={`grid gap-4 border border-ink-strong p-5 desktop:p-10 ${className ?? ""}`}>
      <h2 className="type-h3 text-ink-strong">Waiting for your bank</h2>
      <p className="type-meta text-ink-muted">
        Your bank&rsquo;s payment confirmation is taking longer than usual. This does not mean your
        payment has failed.
      </p>
      {order.paymentReference ? (
        <p className="type-meta text-ink-strong">Payment reference ID: {order.paymentReference}</p>
      ) : null}
      <p className="type-meta text-ink-muted">
        If your account has been debited, please do not pay again. We&rsquo;ll email{" "}
        {order.email ?? "you"} when the bank confirms the result.
      </p>
      <p className="type-meta text-ink-muted">
        You can safely leave this page and return with your order reference. If the delay continues,
        contact support and quote your order reference.
      </p>
      <a
        className="type-meta inline-flex min-h-9 items-center text-ink-strong underline underline-offset-4"
        href={buildSupportHref(order, "Payment status enquiry")}
      >
        Contact support
      </a>
    </section>
  );
}

function GuestActivation({
  className,
  email,
  returnTo,
}: {
  className?: string;
  email: string | null;
  returnTo: string;
}) {
  const href = `/login?return_to=${encodeURIComponent(returnTo)}`;
  return (
    <section
      aria-labelledby="guest-activation-heading"
      className={`grid gap-4 border border-ink-strong p-5 desktop:p-10 ${className ?? ""}`}
    >
      <h2 className="type-h3 text-ink-strong" id="guest-activation-heading">
        Save this order to your account
      </h2>
      <p className="type-meta text-ink-strong">
        Sign in with {email ?? "the email used at checkout"} to track this order and keep your
        details in one place.
      </p>
      <p className="type-meta text-ink-muted">
        Shopify will send a secure sign-in link to your email. Your order is already placed, so
        activating your account is optional.
      </p>
      <Button
        className="h-10.5 w-full bg-ink-strong hover:bg-ink-strong/80 desktop:w-auto"
        render={<Link href={href} />}
      >
        Activate account
      </Button>
    </section>
  );
}
