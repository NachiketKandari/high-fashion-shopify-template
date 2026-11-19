"use client";

import { getShopPayButtonUrl } from "@shopify/hydrogen";
import { cn } from "cn";
import { Loader2 } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { useCartDrawer } from "@/components/cart/context";
import { useDisplayPrice } from "@/components/currency/provider";
import { Button } from "@/components/ui/button";
import type { Money } from "@/lib/money/types";
import { getProductPurchaseOptions } from "@/lib/product";
import { useProductForm } from "@/lib/product/client";
import type { ProductFormVariant, SellingPlanAllocation } from "@/lib/product/types";

interface BuyButtonsProps {
  availableForSale?: boolean;
  buyWithShop?: boolean;
  fallbackVariant: ProductFormVariant | undefined;
  onAddToCart?: () => void;
}

export function BuyButtons({
  availableForSale = true,
  buyWithShop = true,
  fallbackVariant,
  onAddToCart,
}: BuyButtonsProps) {
  const { formProps, pending, register, selectedVariant: storeVariant } = useProductForm();
  const selectedVariant = storeVariant ?? fallbackVariant;
  const isSelectionUnresolved = !storeVariant;
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [purchaseOption, setPurchaseOption] = useState("");
  const { plans, selectedPlan } = getProductPurchaseOptions(selectedVariant, purchaseOption);
  const missingRequiredPlan = Boolean(selectedVariant?.requiresSellingPlan && !selectedPlan);
  const { openOverlay } = useCartDrawer();

  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setIsBuyingNow(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);
  if (!selectedVariant) {
    return null;
  }
  const requiresBundleConfiguration = selectedVariant.requiresBundleConfiguration;
  const isOutOfStock = !selectedVariant.availableForSale;
  // Keep href while buying: removing it during the click cancels the anchor's navigation.
  const buyNowUrl = getShopPayButtonUrl({
    disabled: isSelectionUnresolved || isOutOfStock || requiresBundleConfiguration || pending,
    variants: [{ id: selectedVariant.id, quantity: 1 }],
  });
  const getButtonText = () => {
    if (pending) return "Adding to cart…";
    if (isSelectionUnresolved) return "Select size";
    if (requiresBundleConfiguration) return "Choose bundle items";
    if (missingRequiredPlan) return "Subscription unavailable";
    if (isOutOfStock) return "Out of stock";
    return "Add to cart";
  };
  return (
    <form
      {...formProps({
        beforeSubmit: (event) => {
          if (
            isSelectionUnresolved ||
            isOutOfStock ||
            requiresBundleConfiguration ||
            missingRequiredPlan ||
            pending
          ) {
            event.preventDefault();
            return;
          }
          onAddToCart?.();
          openOverlay();
        },
      })}
      className="grid gap-6"
    >
      <PurchaseOptions
        disabled={pending || isSelectionUnresolved}
        onSelect={setPurchaseOption}
        plans={plans}
        price={selectedVariant.price}
        requiresSellingPlan={selectedVariant.requiresSellingPlan}
        selectedPlan={selectedPlan}
      />
      <input type="hidden" name="sellingPlanId" value={selectedPlan?.sellingPlan.id ?? ""} />
      <input type="hidden" {...register("merchandiseId", {})} />
      <input type="hidden" {...register("quantity", { value: 1 })} />
      <Button
        {...register("addToCart", {})}
        data-selection-unresolved={isSelectionUnresolved && !pending}
        disabled={
          isSelectionUnresolved ||
          isOutOfStock ||
          requiresBundleConfiguration ||
          missingRequiredPlan ||
          pending
        }
        className="h-10 w-full justify-center disabled:bg-surface disabled:text-ink-muted disabled:opacity-100"
      >
        {getButtonText()}
      </Button>
      {buyWithShop && !selectedPlan && !selectedVariant.requiresSellingPlan ? (
        <a
          aria-busy={isBuyingNow || undefined}
          aria-disabled={buyNowUrl ? undefined : true}
          aria-label="Buy it now"
          className={cn(
            "type-control flex h-10 w-full cursor-pointer items-center justify-center bg-ink px-4 text-inverse transition-opacity hover:opacity-80 aria-busy:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[selection-unresolved=true]:aria-disabled:opacity-100",
            !availableForSale && "invisible",
          )}
          data-selection-unresolved={isSelectionUnresolved}
          href={buyNowUrl ?? undefined}
          onClick={(event) => {
            if (!buyNowUrl || isBuyingNow) {
              event.preventDefault();
              return;
            }
            setIsBuyingNow(true);
          }}
          rel="nofollow"
        >
          {isBuyingNow ? <Loader2 className="size-4 animate-spin" /> : <span>Buy it now</span>}
        </a>
      ) : null}
    </form>
  );
}

interface PurchaseOptionsProps {
  disabled?: boolean;
  onSelect?: (id: string) => void;
  plans: SellingPlanAllocation[];
  price: Money;
  requiresSellingPlan: boolean;
  selectedPlan: SellingPlanAllocation | undefined;
}

export function PurchaseOptions({
  disabled = false,
  onSelect,
  plans,
  price,
  requiresSellingPlan,
  selectedPlan,
}: PurchaseOptionsProps) {
  const purchaseOptionId = useId();
  const format = useDisplayPrice();
  if (plans.length === 0) return null;

  return (
    <fieldset className="grid gap-2.5" disabled={disabled}>
      <legend className="type-h4 pb-2.5">Purchase options</legend>
      {[
        ...(!requiresSellingPlan ? [{ id: "", name: "One-time purchase", price }] : []),
        ...plans.map((allocation) => ({
          id: allocation.sellingPlan.id,
          name: allocation.sellingPlan.name,
          price: allocation.price,
        })),
      ].map((option) => (
        <label
          key={option.id}
          className="type-body-sm flex min-h-9 cursor-pointer items-center gap-2.5 border border-rule p-4 has-checked:border-ink has-disabled:cursor-not-allowed has-disabled:opacity-50"
        >
          <input
            type="radio"
            name={purchaseOptionId}
            value={option.id}
            checked={(selectedPlan?.sellingPlan.id ?? "") === option.id}
            onChange={onSelect ? () => onSelect(option.id) : undefined}
            readOnly={!onSelect}
            className="size-4 cursor-pointer accent-ink disabled:cursor-not-allowed"
          />
          <span className="flex flex-1 flex-wrap items-center justify-between gap-2.5">
            <span>{option.name}</span>
            <span className="tabular-nums">{format(option.price)}</span>
          </span>
        </label>
      ))}
      {selectedPlan ? (
        <p className="type-body-sm text-ink-muted">
          Recurring purchase.{" "}
          {selectedPlan.sellingPlan.description || "Subscription details are shown at checkout."}
        </p>
      ) : null}
    </fieldset>
  );
}
