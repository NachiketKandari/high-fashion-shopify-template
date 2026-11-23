"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import { lookupOrderAction } from "@/lib/orders/action";
import type { OrderLookupResult } from "@/lib/orders/types";

const INITIAL_STATE: OrderLookupResult | null = null;

export function TrackOrderForm() {
  const [state, formAction, isPending] = useActionState(lookupOrderAction, INITIAL_STATE);
  const [orderReference, setOrderReference] = useState("");
  const [email, setEmail] = useState("");
  const fieldErrors = state?.status === "invalid" ? state.fieldErrors : {};

  return (
    <form action={formAction} className="grid gap-5">
      <h1 className="type-h2 text-ink-strong">Track your order</h1>
      <p className="type-body-sm text-ink-strong">No login required</p>
      <p className="type-body-sm text-ink-muted">
        Enter your order reference and the email address used at checkout to see the latest delivery
        status.
      </p>

      {state?.status === "unavailable" ? (
        <div className="grid gap-2 border border-ink-strong p-4" role="status">
          <p className="type-h4 text-ink-strong">Order lookup is unavailable</p>
          <p className="type-body-sm text-ink-muted">
            Contact support with your order reference and the email used at checkout, and we’ll
            share the latest delivery status.
          </p>
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label className="type-body-sm text-ink-strong" htmlFor="orderReference">
          Order reference
        </Label>
        <Input
          aria-describedby={fieldErrors.orderReference ? "orderReference-error" : undefined}
          aria-invalid={Boolean(fieldErrors.orderReference)}
          className="h-12 border-ink-muted px-3.5"
          id="orderReference"
          name="orderReference"
          onChange={(event) => setOrderReference(event.target.value)}
          placeholder="Enter your order reference"
          value={orderReference}
        />
        {fieldErrors.orderReference ? (
          <p className="type-body-sm text-error-rule" id="orderReference-error">
            {fieldErrors.orderReference}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label className="type-body-sm text-ink-strong" htmlFor="email">
          Email used at checkout
        </Label>
        <Input
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          aria-invalid={Boolean(fieldErrors.email)}
          autoComplete="email"
          className="h-12 border-ink-muted px-3.5"
          id="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email address"
          type="email"
          value={email}
        />
        {fieldErrors.email ? (
          <p className="type-body-sm text-error-rule" id="email-error">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <p className="type-body-sm text-ink-muted">
        Find your order reference in your order confirmation email.
      </p>
      <Button
        className="h-12 w-full bg-ink-strong hover:bg-ink-strong/80"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Tracking…" : "Track Order"}
      </Button>
      <Link
        className="type-body-sm inline-flex min-h-9 items-center text-ink-strong hover:underline"
        href="/pages/contact-us"
      >
        Need help? Contact support
      </Link>
      <p className="type-body-sm text-ink-muted">
        Your order details are only shown when both entries match.
      </p>
    </form>
  );
}
