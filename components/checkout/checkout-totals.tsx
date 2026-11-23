"use client";

import { useState } from "react";

import { Price } from "@/components/product/price";
import { Checkbox } from "@/components/ui/checkbox";
import type { Cart } from "@/lib/cart/types";
import type { Money } from "@/lib/money/types";

interface CheckoutTotalsProps {
  cart: Cart;
  className?: string;
  storeCredit: Money[];
}

export function CheckoutTotals({ cart, className, storeCredit }: CheckoutTotalsProps) {
  const [useStoreCredit, setUseStoreCredit] = useState(true);

  const appliedCodes = cart.discountCodes
    .filter((discount) => discount.applicable)
    .map((discount) => discount.code);

  const cartCurrency = cart.cost.totalAmount.currencyCode;
  const cartTotal = Number(cart.cost.totalAmount.amount);
  const storeCreditAmount = storeCredit
    .filter((credit) => credit.currencyCode === cartCurrency)
    .reduce((total, credit) => total + Number(credit.amount), 0);
  const appliedCredit = useStoreCredit ? Math.min(storeCreditAmount, cartTotal) : 0;
  const amountDue = Math.max(0, cartTotal - appliedCredit);

  return (
    <div className={className}>
      <div className="grid gap-6">
        {storeCreditAmount > 0 ? (
          <div className="flex min-h-4 items-center justify-between gap-4">
            <Checkbox
              checked={useStoreCredit}
              className="type-meta min-h-0 text-ink"
              label="Use account credits"
              onCheckedChange={setUseStoreCredit}
            />
            <span className="type-meta text-ink-strong">
              <Price amount={String(storeCreditAmount)} currencyCode={cartCurrency} />
            </span>
          </div>
        ) : null}

        <dl className="grid gap-6 text-ink-strong">
          <div className="flex items-baseline justify-between gap-8">
            <dt className="type-h4">Subtotal</dt>
            <dd className="type-h4">
              <Price
                amount={cart.cost.subtotalAmount.amount}
                currencyCode={cart.cost.subtotalAmount.currencyCode}
              />
            </dd>
          </div>
          {appliedCodes.length > 0 ? (
            <div className="flex items-baseline justify-between gap-8">
              <dt className="type-h4">Promo code</dt>
              <dd className="type-h4">{appliedCodes.join(", ")}</dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between gap-8">
            <dt className="type-h4">Delivery</dt>
            <dd className="type-h4">Calculated at checkout</dd>
          </div>
          {appliedCredit > 0 ? (
            <div className="flex items-baseline justify-between gap-8">
              <dt className="type-h4">Account credits</dt>
              <dd className="type-h4">
                - <Price amount={String(appliedCredit)} currencyCode={cartCurrency} />
              </dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between gap-8">
            <dt className="type-nav">TOTAL</dt>
            <dd className="type-nav">
              <Price amount={String(amountDue)} currencyCode={cartCurrency} />
            </dd>
          </div>
        </dl>

        {appliedCredit > 0 ? (
          <p className="type-meta text-ink-muted">
            Account credits are applied at Shopify checkout.
          </p>
        ) : null}
      </div>
    </div>
  );
}
