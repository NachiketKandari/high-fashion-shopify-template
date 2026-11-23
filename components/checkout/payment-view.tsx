"use client";

import { Loader2, LockIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { PaymentMarks } from "@/components/footer/payment-marks";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { useCheckout, useSuspenseCart } from "@/lib/cart/client";
import type { Money } from "@/lib/money/types";

import { CheckoutItems } from "./checkout-items";
import { CheckoutTotals } from "./checkout-totals";
import { PromoCode } from "./promo-code";

interface PaymentViewProps {
  storeCredit: Money[];
}

export function PaymentView({ storeCredit }: PaymentViewProps) {
  const cart = useSuspenseCart((state) => state.data);
  const router = useRouter();
  const {
    checkoutError,
    checkoutErrorId,
    handleCheckout,
    isCartMutating,
    isCheckingOut,
    isCheckoutDisabled,
  } = useCheckout();

  useEffect(() => {
    if (cart.totalQuantity === 0) router.replace("/cart");
  }, [cart.totalQuantity, router]);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-10 desktop:flex-row desktop:gap-0 desktop:py-0">
      <div className="contents desktop:flex desktop:max-w-[800px] desktop:min-w-0 desktop:flex-1 desktop:flex-col desktop:gap-10 desktop:py-6 desktop:pr-10 desktop:pl-6">
        <section aria-labelledby="payment-heading" className="order-2 grid gap-8 desktop:order-1">
          <div className="grid gap-2">
            <h1 className="type-h3 text-ink-strong" id="payment-heading">
              Payment
            </h1>
            <p className="type-meta text-ink-muted">
              Review your order, then complete payment in Shopify&rsquo;s secure checkout.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex min-h-9 max-w-[453px] items-center justify-between gap-4">
              <h2 className="type-meta-bold text-ink-strong">Delivery</h2>
              <Link
                className="type-meta-medium focus-ring inline-flex min-h-9 items-center text-ink-muted hover:underline"
                href="/checkout/address"
              >
                Edit delivery details
              </Link>
            </div>
            <p className="type-meta max-w-[453px] text-ink-muted">
              Delivery date and shipping cost are confirmed at checkout.
            </p>
          </div>

          <div className="grid gap-6">
            <h2 className="type-meta-bold text-ink-strong">Payment Method</h2>
            <div className="grid max-w-[453px] gap-5 border border-ink-strong bg-paper p-6">
              <div className="grid gap-1">
                <p className="type-meta-semibold text-ink-strong">Cards, UPI &amp; wallets</p>
                <p className="type-meta text-ink-muted">
                  Choose your method on the next secure step.
                </p>
              </div>

              <PaymentMarks />

              <p className="type-meta text-ink-muted">
                Cards are processed onsite by Razorpay. UPI, netbanking and wallets are available in
                the same checkout. This store never receives or stores your card details.
              </p>

              <p className="type-meta inline-flex items-center gap-2 text-ink-muted">
                <LockIcon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.25} />
                All transactions are secure and encrypted.
              </p>
            </div>
          </div>

          <p className="type-meta max-w-[453px] text-ink-muted">
            Need help with your order?{" "}
            <Link
              className="focus-ring inline-flex min-h-9 items-center underline underline-offset-4"
              href="/pages/contact-us"
            >
              Contact us
            </Link>
            .
          </p>
        </section>
      </div>

      <aside className="contents desktop:sticky desktop:top-0 desktop:flex desktop:w-[592px] desktop:shrink-0 desktop:flex-col desktop:gap-10 desktop:self-start desktop:border-l desktop:border-ink desktop:px-20 desktop:pt-1.5 desktop:pb-35">
        <CheckoutItems cart={cart} className="order-1 desktop:order-1" defaultOpen />

        <div className="order-3 grid gap-8 desktop:order-2">
          <CheckoutTotals cart={cart} storeCredit={storeCredit} />

          <div className="grid gap-2.5">
            <Button
              aria-busy={isCheckingOut || isCartMutating || undefined}
              aria-describedby={checkoutError ? checkoutErrorId : undefined}
              className="type-meta-medium h-10 w-full justify-center bg-ink-strong px-6 hover:bg-ink-strong/80"
              disabled={isCheckoutDisabled}
              onClick={handleCheckout}
            >
              {isCheckingOut ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : null}
              Continue to Secure Checkout
            </Button>
            {checkoutError ? (
              <p className="type-body-sm text-error-rule" id={checkoutErrorId} role="alert">
                {checkoutError}
              </p>
            ) : null}
            <p className="type-meta text-center text-ink-muted">
              Payments are completed on Shopify&rsquo;s secure checkout.
            </p>
          </div>
        </div>

        <PromoCode cart={cart} className="order-4 desktop:order-3" />

        <Link
          className="type-meta-medium focus-ring order-5 inline-flex min-h-9 w-fit items-center text-ink-muted hover:underline desktop:order-4"
          href="/pages/contact-us"
        >
          need help? contact us
        </Link>
      </aside>
    </div>
  );
}
