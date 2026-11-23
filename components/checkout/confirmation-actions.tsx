"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ConfirmationAddress, ConfirmationPolicyState } from "@/lib/checkout/types";
import { shopConfig } from "@/lib/config";

interface ConfirmationActionsProps {
  address: ConfirmationAddress | null;
  orderName: string;
  policyState: ConfirmationPolicyState;
  total: string;
}

function supportHref(subject: string, body: string[]): string {
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.join("\n"))}`;
  return `mailto:${shopConfig.site.contact.email}?${query}`;
}

export function ConfirmationActions({
  address,
  orderName,
  policyState,
  total,
}: ConfirmationActionsProps) {
  const [isAddressOpen, setAddressOpen] = useState(false);
  const [isCancelOpen, setCancelOpen] = useState(false);
  const [unit, setUnit] = useState(address?.unit ?? "");
  const [street, setStreet] = useState(address?.street ?? "");

  const addressHref = supportHref("Address correction request", [
    `Order reference: ${orderName}`,
    `Apartment / flat number: ${unit}`,
    `Building / street number: ${street}`,
    `Delivery area: ${address?.area ?? ""}`,
    "",
    "Please review this correction within the 24-hour window.",
  ]);

  const cancelHref = supportHref(
    policyState === "expired"
      ? "Order cancellation request — account balance"
      : "Order cancellation request — original payment method",
    [
      `Order reference: ${orderName}`,
      `Order total: ${total}`,
      "",
      "Please confirm the cancellation and refund destination.",
    ],
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        {policyState === "expired" ? (
          <span className="type-meta text-ink-muted">Address correction closed</span>
        ) : (
          <button
            className="type-meta-medium focus-ring inline-flex min-h-9 cursor-pointer items-center text-ink-strong hover:underline"
            onClick={() => setAddressOpen(true)}
            type="button"
          >
            Modify Address
          </button>
        )}
        <button
          className="type-meta-medium focus-ring inline-flex min-h-9 cursor-pointer items-center text-ink-strong hover:underline"
          onClick={() => setCancelOpen(true)}
          type="button"
        >
          Cancel Order
        </button>
      </div>

      <Dialog onOpenChange={setAddressOpen} open={isAddressOpen}>
        <DialogContent className="top-20 max-h-[calc(100dvh-4rem)] max-w-[560px] translate-y-0 gap-4 overflow-y-auto p-8 desktop:top-[90px] desktop:translate-y-0">
          <DialogHeader className="text-left">
            <DialogTitle className="type-h2">Modify Address</DialogTitle>
            <DialogDescription className="type-meta text-ink-strong">
              Address correction available within 24 hours
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1">
            <p className="type-meta text-ink-muted">Order reference: {orderName}</p>
            <p className="type-meta text-ink-muted">
              Correct your apartment or street number without cancelling your order.
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label className="type-meta text-ink-strong" htmlFor="confirmation-unit">
              Apartment / flat number
            </Label>
            <Input
              className="h-11"
              id="confirmation-unit"
              onChange={(event) => setUnit(event.target.value)}
              value={unit}
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="type-meta text-ink-strong" htmlFor="confirmation-street">
              Building / street number
            </Label>
            <Input
              className="h-11"
              id="confirmation-street"
              onChange={(event) => setStreet(event.target.value)}
              value={street}
            />
          </div>

          <div className="grid gap-1">
            <p className="type-meta text-ink-strong">Delivery area (unchanged)</p>
            <p className="type-meta text-ink-muted">{address?.area ?? ""}</p>
          </div>

          <p className="type-meta text-ink-muted">
            Only apartment and street details can be corrected here. Your order and payment remain
            unchanged.
          </p>

          <DialogFooter className="flex-col gap-4 desktop:flex-col desktop:justify-normal">
            <Button
              className="h-11 w-full bg-ink-strong hover:bg-ink-strong/80"
              render={<a href={addressHref} />}
            >
              Request Address Change
            </Button>
            <Button
              className="h-11 w-full border-ink-strong"
              onClick={() => setAddressOpen(false)}
              variant="outline"
            >
              Keep Current Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setCancelOpen} open={isCancelOpen}>
        <DialogContent className="top-20 max-h-[calc(100dvh-4rem)] max-w-[560px] translate-y-0 gap-4 overflow-y-auto p-8 desktop:top-[90px] desktop:translate-y-0">
          <DialogHeader className="text-left">
            <DialogTitle className="type-h2">Cancel this order?</DialogTitle>
            <DialogDescription className="type-meta text-ink-muted">
              Order reference: {orderName}
            </DialogDescription>
          </DialogHeader>

          <p className="type-meta text-ink-muted">
            Review where your {total} will be returned before confirming.
          </p>

          <div
            className={
              policyState === "expired"
                ? "grid gap-2 border border-ink-muted/40 p-4 text-ink-muted"
                : "grid gap-2 border border-ink-strong p-4"
            }
          >
            <p className="type-h4">≤ 24h — current order</p>
            <p className="type-meta">{total} refunded to your original card.</p>
          </div>

          <div
            className={
              policyState === "expired"
                ? "grid gap-2 border border-ink-strong p-4"
                : "grid gap-2 border border-ink-muted/40 p-4 text-ink-muted"
            }
          >
            <p className="type-h4">&gt; 24h — after the refund window</p>
            <p className="type-meta">Cancellations credited to Account Balance wallet</p>
            <p className="type-meta">
              {total} is saved in your wallet for future purchases, not returned to your card.
            </p>
          </div>

          <p className="type-meta text-ink-muted">
            Your refund destination is determined by the time since you placed the order.
          </p>
          <p className="type-meta text-ink-strong">Cancellation cannot be undone.</p>

          <DialogFooter className="flex-col gap-4 desktop:flex-col desktop:justify-normal">
            <Button
              className="h-11 w-full bg-ink-strong hover:bg-ink-strong/80"
              render={<a href={cancelHref} />}
            >
              {policyState === "expired"
                ? "Request Cancellation — Account Balance"
                : "Request Cancellation — Refund to Card"}
            </Button>
            <Button
              className="h-11 w-full border-ink-strong"
              onClick={() => setCancelOpen(false)}
              variant="outline"
            >
              Keep My Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
