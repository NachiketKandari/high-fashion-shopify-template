"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import {
  formatReturnItemOptions,
  getNonReturnableMessage,
  getOtherItemsSummary,
} from "@/lib/returns";
import { estimateReturnAction } from "@/lib/returns/action";
import type { ReturnContext, ReturnEstimate, ReturnableItem } from "@/lib/returns/types";

import { ReturnBreadcrumb } from "./return-breadcrumb";
import { ReturnItemCard } from "./return-item-card";
import { ReturnShell } from "./return-shell";
import { ReturnStepper } from "./return-stepper";
import { ReturnSummary } from "./return-summary";

interface ReturnItemsStepProps {
  context: ReturnContext;
  initialEstimate: ReturnEstimate | null;
}

export function ReturnItemsStep({ context, initialEstimate }: ReturnItemsStepProps) {
  const router = useRouter();
  const initialItem = context.items[0] ?? null;
  const [selectedId, setSelectedId] = useState(initialItem?.id ?? "");
  const [estimate, setEstimate] = useState<ReturnEstimate | null>(initialEstimate);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const estimateRequest = useRef(0);

  const selectedItem = context.items.find((item) => item.id === selectedId) ?? null;
  const otherItems = getOtherItemsSummary(context, selectedId);

  function selectItem(item: ReturnableItem) {
    const request = estimateRequest.current + 1;
    estimateRequest.current = request;
    setSelectedId(item.id);
    setEstimate(null);
    setEstimateError(null);
    startTransition(async () => {
      const result = await estimateReturnAction({
        lineItemId: item.id,
        orderId: context.orderId,
        quantity: item.availableQuantity,
      });
      if (request !== estimateRequest.current) return;
      if (result.success && result.estimate) {
        setEstimate(result.estimate);
        return;
      }
      setEstimateError(result.error ?? "Could not calculate the return value.");
    });
  }

  function continueToResolution() {
    if (!selectedItem) return;
    const params = new URLSearchParams({ item: selectedItem.id });
    router.push(`/returns/${encodeURIComponent(context.orderId)}/resolution?${params.toString()}`);
  }

  const summary = (
    <ReturnSummary
      estimate={estimate}
      estimateMessage={
        isPending
          ? "Calculating return value…"
          : (estimateError ??
            (selectedItem
              ? "The estimated return value is unavailable. Continue to see it on the next step."
              : "Select an item to see its estimated return value."))
      }
      item={
        selectedItem
          ? {
              options: formatReturnItemOptions(selectedItem.options),
              quantity: selectedItem.availableQuantity,
              title: selectedItem.title,
            }
          : null
      }
      orderName={context.orderName}
      otherItems={otherItems}
    />
  );

  if (context.items.length === 0) {
    return (
      <ReturnShell
        summary={
          <ReturnSummary
            estimate={null}
            estimateMessage="No returnable items remain on this order."
            item={null}
            orderName={context.orderName}
          />
        }
      >
        <ReturnBreadcrumb orderId={context.orderId} />
        <h1 className="type-h2 text-ink-strong">Select items to return</h1>
        <p className="type-body-sm text-ink-muted">Order reference: {context.orderName}</p>
        <div className="grid gap-4 border border-ink p-5">
          <p className="type-body">No items in this order are eligible for return.</p>
          <p className="type-body-sm text-ink-muted">
            {getNonReturnableMessage(context.nonReturnableSummary?.reasons ?? []) ??
              "If you believe this is a mistake, contact the concierge with your order reference."}
          </p>
          <Link
            className="type-control focus-ring inline-flex min-h-9 w-fit items-center text-ink underline underline-offset-4"
            href="/pages/contact-us"
          >
            Contact concierge
          </Link>
        </div>
        <Link
          className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink hover:underline"
          href={`/account/orders/${encodeURIComponent(context.orderId)}`}
        >
          Back to order
        </Link>
      </ReturnShell>
    );
  }

  return (
    <ReturnShell summary={summary}>
      <ReturnBreadcrumb orderId={context.orderId} />
      <h1 className="type-h2 text-ink-strong">Select items to return</h1>
      <p className="type-body-sm text-ink-muted">Order reference: {context.orderName}</p>
      <ReturnStepper current={1} />

      <p className="type-body-sm text-ink">
        Choose the item you wish to send back. If you need to return more than one, submit a
        separate request for each.
      </p>

      <fieldset className="grid gap-6">
        <legend className="sr-only">Choose an item to return</legend>
        {context.items.map((item) => (
          <ReturnItemCard
            item={item}
            key={item.id}
            onSelect={() => selectItem(item)}
            selected={item.id === selectedId}
          />
        ))}
      </fieldset>

      <div className="grid gap-3 border border-ink p-5">
        <p className="type-body">
          {selectedItem ? `1 of ${context.items.length} items selected` : "No item selected"}
        </p>
        <p className="type-body-sm text-ink-muted">
          Only the selected item will be included in this request. The other items remain in your
          order.
        </p>
      </div>

      {estimateError ? (
        <p className="type-body-sm text-error-rule" role="alert">
          {estimateError}
        </p>
      ) : null}

      <Button
        className="w-full"
        disabled={!selectedItem || isPending}
        onClick={continueToResolution}
        size="lg"
      >
        Continue with {selectedItem?.availableQuantity ?? 1}{" "}
        {(selectedItem?.availableQuantity ?? 1) === 1 ? "item" : "items"}
      </Button>

      <Link
        className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink hover:underline"
        href={`/account/orders/${encodeURIComponent(context.orderId)}`}
      >
        Back to order
      </Link>
    </ReturnShell>
  );
}
