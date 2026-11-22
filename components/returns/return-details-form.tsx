"use client";

import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Textarea } from "@/components/ui/textarea";
import { shopConfig } from "@/lib/config";
import { getReturnReasonOptions, isIssueReason } from "@/lib/returns";
import { submitReturnAction } from "@/lib/returns/action";
import type {
  ReturnContext,
  ReturnEstimate,
  ReturnReasonOption,
  ReturnRefundMethod,
  ReturnableItem,
} from "@/lib/returns/types";

interface ReturnDetailsFormProps {
  context: ReturnContext;
  estimate: ReturnEstimate | null;
  initialReasonId?: string;
  initialReasonLabel?: string;
  item: ReturnableItem;
  replacement: { id: string; label: string } | null;
  resolution: "exchange" | "return";
}

export function ReturnDetailsForm({
  context,
  estimate,
  initialReasonId,
  initialReasonLabel,
  item,
  replacement,
  resolution,
}: ReturnDetailsFormProps) {
  const router = useRouter();
  const reasons = getReturnReasonOptions(item);
  const initialReason =
    reasons.find((reason) => reason.id === initialReasonId) ??
    reasons.find((reason) => reason.label === initialReasonLabel) ??
    reasons[0];
  const [reason, setReason] = useState<ReturnReasonOption | undefined>(initialReason);
  const [refundMethod, setRefundMethod] = useState<ReturnRefundMethod>("wallet");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const encodedOrderId = encodeURIComponent(context.orderId);

  function selectReason(label: string) {
    const next = reasons.find((entry) => entry.label === label);
    setReason(next);
    setFieldErrors({});
    setError(null);
    if (refundMethod === "original" && !isIssueReason(label)) {
      setRefundMethod("wallet");
    }
  }

  function submit() {
    if (!reason) {
      setError("Choose a reason before submitting.");
      return;
    }
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await submitReturnAction({
        lineItemId: item.id,
        note,
        orderId: context.orderId,
        quantity: item.availableQuantity,
        reasonDefinitionId: reason.id ?? undefined,
        reasonLabel: reason.label,
        refundMethod: resolution === "return" ? refundMethod : undefined,
        replacementLabel: replacement?.label,
        replacementVariantId: replacement?.id,
        resolution,
      });
      if (result.success && result.returnId) {
        router.push(`/returns/${encodedOrderId}/request/${encodeURIComponent(result.returnId)}`);
        return;
      }
      setError(result.error ?? "Could not submit this request.");
      setFieldErrors(result.fieldErrors ?? {});
    });
  }

  const originalPaymentEligible = isIssueReason(reason?.label ?? "");

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {resolution === "exchange" && replacement ? (
        <div className="grid gap-2 border border-ink p-5">
          <p className="type-body text-ink">Exchange · {item.title}</p>
          <p className="type-body-sm text-ink-muted">
            Replacement: {replacement.label}. Availability is confirmed again before dispatch.
          </p>
        </div>
      ) : null}

      <div className="grid gap-2">
        <label className="type-body-sm text-ink" htmlFor="return-reason">
          Reason for {resolution === "exchange" ? "exchange" : "return"} *
        </label>
        <div className="relative">
          <select
            aria-invalid={fieldErrors.reason ? true : undefined}
            className="type-body-sm h-10 w-full appearance-none border border-ink bg-paper px-4 pr-10 text-ink focus-ring aria-invalid:border-error-rule"
            id="return-reason"
            onChange={(event) => selectReason(event.target.value)}
            required
            value={reason?.label ?? ""}
          >
            {reasons.map((entry) => (
              <option key={entry.label} value={entry.label}>
                {entry.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink"
          />
        </div>
        {fieldErrors.reason ? (
          <p className="type-body-sm text-error-rule" role="alert">
            {fieldErrors.reason}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label className="type-body-sm text-ink" htmlFor="return-note">
          Tell us more (optional)
        </label>
        <Textarea
          className="min-h-24 border-ink"
          id="return-note"
          maxLength={240}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Anything that helps the concierge review this request."
          value={note}
        />
      </div>

      <div className="grid gap-2">
        <span className="type-body-sm text-ink">Supporting photos (optional)</span>
        <p className="type-body-sm border border-ink px-4 py-3 text-ink-muted">
          For damaged or faulty items, email photos to{" "}
          <a
            className="text-ink underline underline-offset-4"
            href={`mailto:${shopConfig.site.contact.email}`}
          >
            {shopConfig.site.contact.email}
          </a>{" "}
          after submitting. Photos are not uploaded with this request.
        </p>
      </div>

      {resolution === "return" ? (
        <fieldset className="grid gap-3">
          <legend className="type-body pb-3 text-ink">Where should the return value go?</legend>
          {[
            {
              description:
                "The return value is credited after inspection approval. Use the balance towards future purchases.",
              disabled: false,
              id: "wallet" as const,
              title: "Account Balance wallet",
            },
            {
              description: originalPaymentEligible
                ? "Eligible for this reason. The concierge confirms the method and processing time before settlement."
                : "Available only for wrong, damaged or faulty items.",
              disabled: !originalPaymentEligible,
              id: "original" as const,
              title: "Original payment method",
            },
          ].map((option) => {
            const selected = refundMethod === option.id;
            return (
              <label
                className={[
                  "grid gap-3 border border-ink p-5 transition-colors duration-(--motion-fast)",
                  option.disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink hover:bg-surface/40",
                ].join(" ")}
                key={option.id}
              >
                <input
                  checked={selected}
                  className="sr-only"
                  disabled={option.disabled}
                  name="refund-method"
                  onChange={() => setRefundMethod(option.id)}
                  type="radio"
                  value={option.id}
                />
                <span className="type-body text-ink">
                  {option.title}
                  {selected ? " — Selected" : ""}
                </span>
                <span className="type-body-sm text-ink-muted">{option.description}</span>
              </label>
            );
          })}
          {fieldErrors.refundMethod ? (
            <p className="type-body-sm text-error-rule" role="alert">
              {fieldErrors.refundMethod}
            </p>
          ) : null}
          {estimate ? (
            <p className="type-body-sm text-ink-muted">
              Estimated return value:{" "}
              <Price amount={estimate.total.amount} currencyCode={estimate.currencyCode} />
            </p>
          ) : null}
        </fieldset>
      ) : null}

      <div className="grid gap-3">
        <p className="type-body text-ink">Pickup address</p>
        {context.shippingAddressLines.length > 0 ? (
          <address className="type-body-sm grid gap-0.5 text-ink-muted not-italic">
            {context.shippingAddressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
        ) : (
          <p className="type-body-sm text-ink-muted">
            The concierge confirms the pickup address before collection.
          </p>
        )}
        <Link
          className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline underline-offset-4"
          href="/pages/contact-us"
        >
          Change pickup address
        </Link>
      </div>

      <p className="type-body-sm text-ink-muted">
        By submitting, I confirm the item is unused with tags and packaging intact.
      </p>

      {error ? (
        <div className="grid gap-3 border border-error-rule bg-error-soft p-4" role="alert">
          <p className="type-body-sm text-error-rule">{error}</p>
          <Link
            className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline underline-offset-4"
            href="/pages/contact-us"
          >
            Contact concierge
          </Link>
        </div>
      ) : null}

      <Button className="w-full" disabled={isPending || !reason} size="lg" type="submit">
        {isPending
          ? "Submitting…"
          : resolution === "exchange"
            ? "Submit Exchange Request"
            : "Submit Return Request"}
      </Button>

      <Link
        className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink hover:underline"
        href={
          resolution === "exchange"
            ? `/returns/${encodedOrderId}/exchange?item=${encodeURIComponent(item.id)}`
            : `/returns/${encodedOrderId}/resolution?item=${encodeURIComponent(item.id)}`
        }
      >
        Back
      </Link>
    </form>
  );
}
