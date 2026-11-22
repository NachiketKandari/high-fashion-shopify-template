import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { formatReturnDate, formatReturnItemOptions, getReturnStatusLabel } from "@/lib/returns";
import type { ReturnRequestDetail } from "@/lib/returns/types";

import { ReturnBreadcrumb } from "./return-breadcrumb";
import { ReturnShell } from "./return-shell";
import { ReturnStepper } from "./return-stepper";
import { ReturnSummary } from "./return-summary";

interface ReturnRequestViewProps {
  detail: ReturnRequestDetail;
}

function getRequestTitle(status: string): string {
  switch (status) {
    case "CANCELED":
      return "Return request canceled";
    case "CLOSED":
      return "Return completed";
    case "DECLINED":
      return "Return request declined";
    case "OPEN":
      return "Return in progress";
    default:
      return "Return request received";
  }
}

function getJourney(request: ReturnRequestDetail["request"]) {
  const received = formatReturnDate(request.createdAt) ?? "Request date unavailable";
  const pickup = request.reverseDelivery?.tracking
    ? `Scheduled with ${request.reverseDelivery.tracking.carrierName ?? "the courier"}`
    : request.reverseDelivery
      ? "Reverse delivery created"
      : "Awaiting confirmation";
  const inspection =
    request.status === "CLOSED"
      ? "Completed"
      : request.status === "OPEN"
        ? "Pending receipt"
        : "Pending";
  const settlement =
    request.status === "CLOSED"
      ? "Completed"
      : request.status === "DECLINED" || request.status === "CANCELED"
        ? "Not applicable"
        : "Awaiting approval";

  return [
    { detail: received, label: "Request received" },
    { detail: pickup, label: "Reverse pickup" },
    { detail: inspection, label: "Inspection" },
    { detail: settlement, label: "Settlement" },
  ];
}

export function ReturnRequestView({ detail }: ReturnRequestViewProps) {
  const { estimate, orderId, orderName, request, shippingAddressLines } = detail;
  const item = request.items[0] ?? null;
  const itemOptions = item ? formatReturnItemOptions(item.options) : "";
  const isActive = request.status === "OPEN" || request.status === "REQUESTED";
  const isDeclined = request.status === "DECLINED" || request.status === "CANCELED";
  const showStepper = request.status === "REQUESTED" || isActive;
  const journey = getJourney(request);
  const statusTitle = getRequestTitle(request.status);
  const statusHeading =
    request.status === "REQUESTED"
      ? `Request received · ${request.name}`
      : request.reverseDelivery?.tracking
        ? `Reverse pickup scheduled · ${request.name}`
        : `${getReturnStatusLabel(request.status)} · ${request.name}`;
  const statusBody =
    request.status === "REQUESTED"
      ? "The concierge reviews your request before a reverse pickup is scheduled."
      : request.status === "OPEN"
        ? "The concierge is processing your return. This page updates when the next step is confirmed."
        : request.status === "CLOSED"
          ? "This return has been closed."
          : (request.declineNote ??
            "This return request is no longer active. Contact the concierge if you need help.");

  return (
    <ReturnShell
      summary={
        <ReturnSummary
          estimate={estimate}
          estimateMessage="The final return value is confirmed after the item is inspected."
          item={item ? { options: itemOptions, quantity: item.quantity, title: item.title } : null}
          orderName={orderName}
          policyCopy={
            request.status === "CLOSED"
              ? "This return has been closed. Any settlement appears in your account."
              : undefined
          }
          request={{ name: request.name, status: getReturnStatusLabel(request.status) }}
        />
      }
    >
      <ReturnBreadcrumb orderId={orderId} />
      <h1 className="type-h2 text-ink-strong">
        {request.status === "REQUESTED" ? "Your return request is received" : statusTitle}
      </h1>
      <p className="type-body-sm text-ink-muted">Order reference: {orderName}</p>

      <div className="grid gap-3 border border-ink p-5">
        <p className="type-body text-ink">{statusHeading}</p>
        <p className="type-body-sm text-ink-muted">{statusBody}</p>
      </div>

      {showStepper ? <ReturnStepper current={4} /> : null}

      {!isDeclined ? (
        <div className="grid gap-3">
          <p className="type-body text-ink">Pickup address</p>
          {shippingAddressLines.length > 0 ? (
            <address className="type-body-sm grid gap-0.5 text-ink-muted not-italic">
              {shippingAddressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          ) : (
            <p className="type-body-sm text-ink-muted">
              The concierge confirms the pickup address before collection.
            </p>
          )}
        </div>
      ) : null}

      {isActive ? (
        <div className="grid gap-3">
          <p className="type-body text-ink">Prepare your parcel</p>
          <p className="type-body-sm text-ink">
            1. Pack only {item?.title ?? "the returned item"}
            {itemOptions ? `, ${itemOptions}` : ""}.
            <br />
            2. Keep tags and original packaging intact.
            <br />
            3.{" "}
            {request.reverseDelivery?.labelUrl
              ? "Attach the return label and hand the sealed parcel to the courier."
              : "Wait for the concierge to confirm your reverse pickup."}
          </p>
        </div>
      ) : null}

      {showStepper ? (
        <div className="grid gap-3 border border-ink p-5">
          <p className="type-body text-ink">What happens next?</p>
          <p className="type-body-sm text-ink-muted">
            The concierge confirms pickup → the courier collects the parcel → it is received at the
            atelier → inspection → resolution. Submitting a request does not mean the return has
            been accepted.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          <p className="type-body text-ink">Return journey</p>
          <ol className="grid gap-3">
            {journey.map((entry, index) => (
              <li className="type-body-sm text-ink" key={`${entry.label}-${index}`}>
                {index + 1}. {entry.label}
                {entry.detail ? ` — ${entry.detail}` : ""}
              </li>
            ))}
          </ol>
        </div>
      )}

      {request.status === "CLOSED" ? (
        <div className="grid gap-3 border border-ink p-5">
          <p className="type-body text-ink">Inspection checklist</p>
          <p className="type-body-sm text-ink-muted">
            Item identity and quantity
            <br />
            Original tags and packaging
            <br />
            Condition, wear and alterations
          </p>
          {isActive ? (
            <p className="type-body-sm text-ink-muted">
              You do not need to take any action right now.
            </p>
          ) : null}
        </div>
      ) : null}

      {estimate && !isDeclined ? (
        <div className="grid gap-3 border border-ink p-5">
          <p className="type-body text-ink">
            {request.status === "CLOSED" ? "Settlement" : "If approved"}
          </p>
          <p className="type-body-sm text-ink-muted">
            <Price amount={estimate.total.amount} currencyCode={estimate.currencyCode} /> is the
            estimated return value. Settlement uses the method confirmed by the concierge. A credit
            note appears in Invoices &amp; Notes when applicable.
          </p>
        </div>
      ) : null}

      {isActive ? (
        <div className="grid gap-3 border border-ink p-5">
          <p className="type-body text-ink">If an issue is found</p>
          <p className="type-body-sm text-ink-muted">
            The concierge will explain the findings and next steps before the request is resolved.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3">
        {request.reverseDelivery?.tracking?.url ? (
          <Button
            render={
              <a
                href={request.reverseDelivery.tracking.url}
                rel="noopener noreferrer"
                target="_blank"
              />
            }
            size="lg"
          >
            Track return
          </Button>
        ) : (
          <Button render={<Link href="/pages/contact-us" />} size="lg">
            Contact concierge
          </Button>
        )}
        {request.reverseDelivery?.labelUrl ? (
          <Button
            render={
              <a
                href={request.reverseDelivery.labelUrl}
                rel="noopener noreferrer"
                target="_blank"
              />
            }
            size="lg"
            variant="outline"
          >
            Download return label
          </Button>
        ) : null}
      </div>

      {request.reverseDelivery?.tracking?.url && !isDeclined ? (
        <Link
          className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink hover:underline"
          href="/pages/contact-us"
        >
          Contact concierge about this request
        </Link>
      ) : null}

      <Link
        className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink hover:underline"
        href={`/account/orders/${encodeURIComponent(orderId)}`}
      >
        Back to order
      </Link>
    </ReturnShell>
  );
}
