"use client";

import type { CartData } from "@shopify/hydrogen";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { useDisplayPrice } from "@/components/currency/provider";
import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { getFreeShippingStatus } from "@/lib/cart";
import { useCart, useCheckout } from "@/lib/cart/client";

import { DiscountForm } from "./discount-form";

interface CartSummaryProps {
  cart: CartData;
  signIn?: ReactNode;
}

export function CartSummary({ cart, signIn }: CartSummaryProps) {
  return (
    <div className="grid gap-4">
      {signIn}
      <CartTotal cart={cart} />
      <CartCheckout />
      <details className="group">
        <summary className="type-body focus-ring flex h-9 cursor-pointer list-none items-center underline underline-offset-4 [&::-webkit-details-marker]:hidden">
          Do you have a promotional code?
        </summary>
        <div className="mt-3">
          <DiscountForm cart={cart} />
        </div>
      </details>
      <Link
        className="type-body-sm focus-ring w-fit underline underline-offset-4"
        href="/pages/contact-us"
      >
        need help? contact us
      </Link>
    </div>
  );
}

export function CartTotal({ cart }: { cart: CartData }) {
  const format = useDisplayPrice();
  const currencyCode = cart.cost.subtotalAmount.currencyCode;
  const { remaining } = getFreeShippingStatus(
    cart.cost.subtotalAmount.amount,
    currencyCode,
    format,
  );
  return (
    <dl className="grid gap-3">
      <div className="flex items-baseline justify-between">
        <dt className="type-body">Subtotal</dt>
        <dd className="type-body">
          <Price
            amount={cart.cost.subtotalAmount.amount}
            className="type-body"
            currencyCode={currencyCode}
          />
        </dd>
      </div>
      <div className="flex items-baseline justify-between">
        <dt className="type-body">Delivery</dt>
        <dd className="type-body">{remaining === 0 ? "Free" : "Calculated at checkout"}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-rule pt-3">
        <dt className="type-h4">TOTAL</dt>
        <dd className="type-h4">
          <Price
            amount={cart.cost.totalAmount.amount}
            className="type-h4"
            currencyCode={cart.cost.totalAmount.currencyCode || currencyCode}
          />
        </dd>
      </div>
    </dl>
  );
}

interface CartCheckoutProps {
  label?: string;
}

export function CartCheckout({ label = "Checkout" }: CartCheckoutProps) {
  const {
    checkoutError,
    checkoutErrorId,
    handleCheckout,
    isCartMutating,
    isCheckingOut,
    isCheckoutDisabled,
  } = useCheckout();
  return (
    <div className="grid gap-2.5">
      <Button
        aria-busy={isCheckingOut || isCartMutating || undefined}
        aria-describedby={checkoutError ? checkoutErrorId : undefined}
        className="h-9 w-full justify-center"
        disabled={isCheckoutDisabled}
        onClick={handleCheckout}
      >
        {isCheckingOut ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
        {label}
      </Button>
      {checkoutError ? (
        <p className="type-body-sm text-error" id={checkoutErrorId} role="alert">
          {checkoutError}
        </p>
      ) : null}
    </div>
  );
}
