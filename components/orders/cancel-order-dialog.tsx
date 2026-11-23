"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "@/components/ui/link";
import { cancelOrderAction } from "@/lib/orders/action";
import type { CancellationRefund, OrderCancellationResult } from "@/lib/orders/types";

interface CancelOrderDialogProps {
  amount: string;
  email: string | null;
  orderId: string;
  orderName: string;
  refund: CancellationRefund;
}

export function CancelOrderDialog({
  amount,
  email,
  orderId,
  orderName,
  refund,
}: CancelOrderDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<OrderCancellationResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const isWallet = refund.kind === "wallet";
  const isNoRefund = refund.kind === "none" || refund.kind === "outstanding";
  const isRequested = result?.status === "requested";
  const errorMessage =
    result?.status === "error"
      ? result.message
      : result?.status === "unavailable"
        ? "This order can no longer be cancelled online. Contact support for help."
        : null;

  function handleRequest() {
    startTransition(async () => {
      const next = await cancelOrderAction({ orderId });
      setResult(next);
      if (next.status === "requested") router.refresh();
    });
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setResult(null);
      }}
      open={open}
    >
      <DialogTrigger
        render={
          <Button className="h-12 w-full border-ink-strong text-ink-strong" variant="outline">
            Cancel Order
          </Button>
        }
      />
      <DialogContent
        className="top-15 w-[calc(100%-2.5rem)] max-h-[calc(100dvh-4.75rem)] max-w-[560px] translate-y-0 gap-4 overflow-y-auto rounded-control border-ink-strong p-5 desktop:top-1/2 desktop:p-8 desktop:-translate-y-1/2"
        overlayClassName="bg-ink-strong/35"
        showCloseButton={false}
      >
        <div className="flex justify-end">
          <DialogClose className="type-body-sm flex min-h-9 items-center text-ink-strong hover:underline">
            Close
          </DialogClose>
        </div>

        {isRequested ? (
          <>
            <DialogTitle className="type-h2 text-ink-strong">Cancellation requested</DialogTitle>
            <DialogDescription className="type-body-sm text-ink-muted">
              Order reference: {orderName}
            </DialogDescription>
            <p className="type-body-sm text-ink-strong">
              We’ve sent your request to cancel the eligible items on this order. Our team will
              review it and email you the outcome.{" "}
              {refund.kind === "none"
                ? "No payment was taken, so no refund is due."
                : refund.kind === "outstanding"
                  ? "No payment has been captured, so no refund is due."
                  : "No refund has been issued yet."}
            </p>
            <div className="grid gap-3">
              <DialogClose
                render={
                  <Button className="h-12 w-full bg-ink-strong hover:bg-ink-strong/80">
                    Back to order
                  </Button>
                }
              />
              <Link
                className="type-body-sm inline-flex min-h-9 items-center justify-center text-ink-strong hover:underline"
                href="/pages/contact-us"
              >
                Contact support
              </Link>
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="type-h2 text-ink-strong">Cancel this order?</DialogTitle>
            <DialogDescription className="type-body-sm text-ink-muted">
              Order reference: {orderName}
            </DialogDescription>
            {refund.timing ? <p className="type-body-sm text-ink-strong">{refund.timing}</p> : null}
            <div className="grid gap-2 border border-ink-strong p-4">
              <p className="type-h4 text-ink-strong">Order total: {amount}</p>
              <p className="type-body-sm text-ink-strong">
                {isNoRefund ? refund.destination : `Refund destination: ${refund.destination}`}
              </p>
            </div>
            <p className="type-body-sm text-ink-muted">{refund.note}</p>
            <p className="type-body-sm text-ink-muted">
              We’ll request cancellation for every item that is still eligible. Our team reviews the
              request before the order is cancelled, and we’ll email you the outcome.
            </p>
            {isWallet && email ? (
              <p className="type-body-sm text-ink-strong">Signed in: {email}</p>
            ) : null}
            <p className="type-body-sm text-ink-strong">
              A cancellation request cannot be withdrawn once it is approved.
            </p>
            {errorMessage ? (
              <p
                className="type-body-sm border border-error-rule bg-error-soft p-3 text-error-rule"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}
            <div className="grid gap-3">
              <Button
                className="h-12 w-full bg-ink-strong hover:bg-ink-strong/80"
                disabled={isPending}
                onClick={handleRequest}
                type="button"
              >
                {isPending ? "Sending request…" : refund.cta}
              </Button>
              <DialogClose
                render={
                  <Button
                    className="h-12 w-full border-ink-strong text-ink-strong"
                    type="button"
                    variant="outline"
                  >
                    Keep My Order
                  </Button>
                }
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
