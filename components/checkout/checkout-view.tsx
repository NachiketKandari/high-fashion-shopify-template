"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/link";
import { useCheckout, useSuspenseCart } from "@/lib/cart/client";
import { getDeliveryErrors, getInitialDelivery, toCustomerAddressInput } from "@/lib/checkout";
import type { DeliveryErrors, DeliverySelection } from "@/lib/checkout/types";
import { createAddressAction } from "@/lib/customer/action";
import type { CustomerAddress } from "@/lib/customer/types";
import type { Money } from "@/lib/money/types";

import { AddressStep } from "./address-step";
import { CheckoutItems } from "./checkout-items";
import { GiftOption } from "./gift-option";
import { PromoCode } from "./promo-code";

interface CheckoutViewProps {
  addresses: CustomerAddress[];
  isSignedIn: boolean;
  storeCredit: Money[];
}

export function CheckoutView({ addresses, isSignedIn, storeCredit }: CheckoutViewProps) {
  const cart = useSuspenseCart((state) => state.data);
  const [selection, setSelection] = useState<DeliverySelection>(() =>
    getInitialDelivery(addresses),
  );
  const [errors, setErrors] = useState<DeliveryErrors>({});
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [useStoreCredit, setUseStoreCredit] = useState(true);
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

  async function handleProceed() {
    const nextErrors = getDeliveryErrors(selection);
    setErrors(nextErrors);
    setSaveError(null);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      document.getElementById(`checkout-${firstError}`)?.focus();
      return;
    }

    if (isSignedIn && saveAddress && selection.mode === "new") {
      setIsSavingAddress(true);
      const result = await createAddressAction(toCustomerAddressInput(selection.draft), true);
      setIsSavingAddress(false);
      if (!result.success) {
        setSaveError(result.error ?? "Could not save this address.");
        return;
      }
    }

    void handleCheckout();
  }

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
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-10 desktop:flex-row desktop:gap-0 desktop:py-0">
      <div className="contents desktop:flex desktop:max-w-[800px] desktop:min-w-0 desktop:flex-1 desktop:flex-col desktop:gap-8 desktop:py-6 desktop:pr-10 desktop:pl-6">
        <AddressStep
          addresses={addresses}
          className={isSignedIn ? "order-3 desktop:order-1" : "order-4 desktop:order-2"}
          errors={errors}
          isSignedIn={isSignedIn}
          isSavingAddress={isSavingAddress}
          onChange={(next) => {
            setSelection(next);
            setErrors({});
            setSaveError(null);
          }}
          onSaveAddressChange={(next) => {
            setSaveAddress(next);
            setSaveError(null);
          }}
          saveAddress={saveAddress}
          saveError={saveError}
          selection={selection}
        />

        <div
          className={
            isSignedIn ? "order-4 grid gap-3 desktop:order-2" : "order-3 grid gap-3 desktop:order-1"
          }
        >
          <div className="flex flex-wrap items-baseline gap-8">
            <p className="type-meta-bold text-ink-strong">Delivery</p>
            <p className="type-meta text-ink-strong">Date and cost are confirmed at checkout.</p>
          </div>
        </div>
      </div>

      <aside className="contents desktop:sticky desktop:top-0 desktop:flex desktop:w-[592px] desktop:shrink-0 desktop:flex-col desktop:gap-10 desktop:self-start desktop:border-l desktop:border-ink desktop:px-20 desktop:pt-1.5 desktop:pb-35">
        <CheckoutItems cart={cart} className="order-1 desktop:order-1" />

        {isSignedIn ? null : (
          <div className="order-2 grid gap-3 pb-6 desktop:order-3 desktop:pb-0">
            <p className="type-meta text-ink">Enjoy a faster shopping experience</p>
            <Link
              className="type-eyebrow focus-ring w-fit uppercase hover:underline"
              href="/account/login?return_to=%2Fcheckout%2Faddress"
            >
              Sign in
            </Link>
          </div>
        )}

        <GiftOption cart={cart} className="order-5 desktop:order-2" />

        <div className="order-6 grid gap-8 desktop:order-4">
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

          <div className="grid gap-2.5">
            <Button
              aria-busy={isCheckingOut || isCartMutating || isSavingAddress || undefined}
              aria-describedby={checkoutError ? checkoutErrorId : undefined}
              className="type-meta-medium h-10 w-full justify-center bg-ink-strong px-6 hover:bg-ink-strong/80"
              disabled={isCheckoutDisabled || isSavingAddress}
              onClick={() => void handleProceed()}
            >
              {isCheckingOut || isSavingAddress ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : null}
              Proceed to Payment
            </Button>
            {checkoutError ? (
              <p className="type-body-sm text-error-rule" id={checkoutErrorId} role="alert">
                {checkoutError}
              </p>
            ) : null}
          </div>
        </div>

        <PromoCode cart={cart} className="order-7 desktop:order-5" />

        <Link
          className="type-meta-medium focus-ring order-8 w-fit text-ink-muted hover:underline desktop:order-6"
          href="/pages/contact-us"
        >
          need help? contact us
        </Link>
      </aside>
    </div>
  );
}
