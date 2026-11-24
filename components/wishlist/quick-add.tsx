"use client";

import type { ValidProductSelectionResult } from "@shopify/hydrogen/react";
import { cn } from "cn";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BuyButtons } from "@/components/product-detail/buy-buttons";
import { NotifyMe } from "@/components/product-detail/notify-me";
import { SizeGuide } from "@/components/product-detail/size-guide";
import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { buildProductUrl, getSizeGuideCategory } from "@/lib/product";
import { ProductProvider, useProduct } from "@/lib/product/client";
import { isSizeOption } from "@/lib/product/sizes";
import type {
  ProductFormInput,
  ProductFormVariant,
  QuickShopProduct,
  SelectedOption,
} from "@/lib/product/types";
import { getWishlistColorLabel } from "@/lib/wishlist";
import { loadWishlistProductAction, resolveWishlistSelectionAction } from "@/lib/wishlist/action";
import type { WishlistItem } from "@/lib/wishlist/types";

interface WishlistQuickAddProps {
  item: WishlistItem;
}

type QuickAddStatus = "error" | "idle" | "loading" | "unavailable";

export function WishlistQuickAdd({ item }: WishlistQuickAddProps) {
  if (!item.product.availableForSale) return <SoldOutQuickAdd item={item} />;
  return <InStockQuickAdd item={item} />;
}

function SoldOutQuickAdd({ item }: WishlistQuickAddProps) {
  const sizeOption = item.product.options?.find((option) => isSizeOption(option.name));
  return (
    <NotifyMe
      product={{
        image: item.product.featuredImage,
        price: item.product.price,
        title: item.product.title,
      }}
      selectedSize={item.selectedOptions.find(({ name }) => isSizeOption(name))?.value}
      sizeOption={
        sizeOption
          ? { name: sizeOption.name, values: sizeOption.values.map((value) => value.name) }
          : undefined
      }
      triggerAriaLabel={`Notify me when ${item.product.title} is back in stock`}
      triggerClassName="h-11"
      triggerLabel="Notify Me"
    />
  );
}

type SelectionStatus = "failed" | "idle" | "loading";

function InStockQuickAdd({ item }: WishlistQuickAddProps) {
  const [cartHandoff, setCartHandoff] = useState(false);
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<QuickShopProduct | null>(null);
  const [resolvedForm, setResolvedForm] = useState<ProductFormInput | null>(null);
  const [confirmedVariant, setConfirmedVariant] = useState<ProductFormVariant>();
  const [selectionStatus, setSelectionStatus] = useState<SelectionStatus>("idle");
  const [status, setStatus] = useState<QuickAddStatus>("idle");
  const selectionRequest = useRef<{ selectedOptions: SelectedOption[] } | null>(null);
  const sizeOption = item.product.options?.find((option) => isSizeOption(option.name));
  const hasSizeChoices = (sizeOption?.values.length ?? 0) > 1;
  const colorLabel = getWishlistColorLabel(item.selectedOptions);
  const sizeGuideCategory = getSizeGuideCategory(item.product.productType);

  useEffect(
    () => () => {
      selectionRequest.current = null;
    },
    [],
  );

  async function resolveSelection(selectedOptions: SelectedOption[]) {
    const request = {
      selectedOptions: selectedOptions.map(({ name, value }) => ({ name, value })),
    };
    selectionRequest.current = request;
    setSelectionStatus("loading");
    try {
      const loaded = await resolveWishlistSelectionAction(
        item.product.handle,
        request.selectedOptions,
      );
      if (selectionRequest.current !== request) return;
      if (!loaded) {
        setSelectionStatus("failed");
        return;
      }
      setResolvedForm(loaded.form);
      setConfirmedVariant(loaded.form.selectedOrFirstAvailableVariant ?? undefined);
      setSelectionStatus("idle");
      selectionRequest.current = null;
    } catch {
      if (selectionRequest.current === request) setSelectionStatus("failed");
    }
  }

  function handleSelect(result: ValidProductSelectionResult<ProductFormInput>) {
    selectionRequest.current = null;
    setSelectionStatus("idle");
    if (!product) return;
    if (result.status === "resolved") {
      setConfirmedVariant(result.selectedVariant);
      return;
    }
    const form = resolvedForm ?? product.form;
    if (
      form.options.every((option) =>
        result.selectedOptions.some(({ name }) => name === option.name),
      )
    ) {
      void resolveSelection(result.selectedOptions);
    }
  }

  async function load() {
    if (status === "loading") return;
    selectionRequest.current = null;
    setResolvedForm(null);
    setSelectionStatus("idle");
    setStatus("loading");
    try {
      const loaded = await loadWishlistProductAction(item.product.handle, item.selectedOptions);
      if (!loaded) {
        setStatus("unavailable");
        return;
      }
      setProduct(loaded);
      setConfirmedVariant(loaded.form.selectedOrFirstAvailableVariant ?? undefined);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setCartHandoff(false);
      if (!product) void load();
    }
  }

  function handleOpenChangeComplete(nextOpen: boolean) {
    if (nextOpen) return;
    selectionRequest.current = null;
    setSelectionStatus("idle");
    setResolvedForm(null);
    setConfirmedVariant(product?.form.selectedOrFirstAvailableVariant ?? undefined);
  }

  return (
    <Sheet
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
      open={open}
    >
      <SheetTrigger
        render={
          <Button
            aria-label={`${hasSizeChoices ? "Choose size" : "Add to bag"}: ${item.product.title}`}
            className="h-11 w-full"
            type="button"
          >
            {hasSizeChoices ? "Choose Size" : "Add to Bag"}
          </Button>
        }
      />
      <SheetContent
        className="w-(--drawer-size) max-w-full gap-0 border-l border-rule p-0"
        closeButton={false}
        finalFocus={cartHandoff ? false : undefined}
        side="right"
      >
        <div className="flex h-18 shrink-0 items-center justify-between gap-4 px-6">
          <SheetTitle className="type-h2">
            {hasSizeChoices ? "Choose your size" : "Add to bag"}
          </SheetTitle>
          <SheetClose
            aria-label="Close size selector"
            className="focus-ring flex size-9 shrink-0 cursor-pointer items-center justify-center"
            type="button"
          >
            <X className="size-4" strokeWidth={1.25} />
          </SheetClose>
        </div>
        <SheetDescription className="sr-only">
          {hasSizeChoices
            ? "Choose a size to add this saved piece to your bag."
            : "Add this saved piece to your bag."}
        </SheetDescription>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-2 pb-8">
          {product ? (
            <ProductProvider onSelect={handleSelect} product={resolvedForm ?? product.form}>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <p className="type-body-sm text-ink">
                    {item.product.title}
                    {colorLabel ? ` · ${colorLabel}` : ""}
                  </p>
                  <WishlistProductPrice
                    fallbackVariant={product.form.selectedOrFirstAvailableVariant ?? undefined}
                  />
                </div>
                <div className="border-t border-rule" />
                {hasSizeChoices ? <SizePicker sizeGuideCategory={sizeGuideCategory} /> : null}
                <WishlistBuyButtons
                  confirmedVariant={confirmedVariant}
                  onAddToCart={() => {
                    setCartHandoff(true);
                    setOpen(false);
                  }}
                  selectionStatus={selectionStatus}
                />
              </div>
            </ProductProvider>
          ) : status === "error" || status === "unavailable" ? (
            <div className="grid gap-4">
              <p className="type-body-sm text-ink-muted" role="status">
                {status === "unavailable"
                  ? colorLabel
                    ? `This piece is unavailable in ${colorLabel} right now.`
                    : "This piece is unavailable right now."
                  : "We couldn’t load the sizes. Try again or open the product page."}
              </p>
              <div className="grid gap-2">
                <Button
                  className="h-11 w-full"
                  onClick={() => void load()}
                  type="button"
                  variant="outline"
                >
                  Try again
                </Button>
                <Link
                  className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center underline underline-offset-4"
                  href={buildProductUrl(item.product.handle, item.selectedOptions)}
                >
                  View product
                </Link>
              </div>
            </div>
          ) : (
            <QuickAddSkeleton />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface WishlistBuyButtonsProps {
  confirmedVariant?: ProductFormVariant;
  onAddToCart: () => void;
  selectionStatus: SelectionStatus;
}

function WishlistBuyButtons({
  confirmedVariant,
  onAddToCart,
  selectionStatus,
}: WishlistBuyButtonsProps) {
  const { selectedVariant } = useProduct();
  const isUnconfirmed =
    selectionStatus !== "idle" || !selectedVariant || selectedVariant.id !== confirmedVariant?.id;

  return (
    <div className="grid gap-3">
      <fieldset className="min-w-0" disabled={isUnconfirmed}>
        <div inert={isUnconfirmed || undefined}>
          <BuyButtons
            availableForSale={selectedVariant?.availableForSale ?? false}
            buyWithShop={false}
            fallbackVariant={confirmedVariant}
            onAddToCart={onAddToCart}
            quantityPicker={false}
            submitLabel={(variant) => {
              const size = variant.selectedOptions.find((option) =>
                isSizeOption(option.name),
              )?.value;
              return size ? `Add to Bag — Size ${size}` : "Add to Bag";
            }}
          />
        </div>
      </fieldset>
      {selectionStatus === "loading" ? (
        <p className="type-body-sm text-ink-muted" role="status">
          Loading size…
        </p>
      ) : null}
      {selectionStatus === "failed" ? (
        <p className="type-body-sm text-ink-muted" role="status">
          This size is unavailable. Choose another size.
        </p>
      ) : null}
      <p className="type-body-sm text-ink-muted">
        This piece stays in your wishlist until you remove it.
      </p>
    </div>
  );
}

function WishlistProductPrice({
  fallbackVariant,
}: {
  fallbackVariant: ProductFormVariant | null | undefined;
}) {
  const { selectedVariant } = useProduct();
  const variant = selectedVariant ?? fallbackVariant;
  if (!variant) return null;
  return (
    <Price
      amount={variant.price.amount}
      className="type-body"
      currencyCode={variant.price.currencyCode}
    />
  );
}

interface SizePickerProps {
  sizeGuideCategory?: string;
}

function SizePicker({ sizeGuideCategory }: SizePickerProps) {
  const { options, selectOption } = useProduct();
  const sizeOption = options.find((option) => isSizeOption(option.name));
  if (!sizeOption) return null;
  const selectedSize = sizeOption.values.find((value) => value.selected)?.name;
  const unavailableNames = sizeOption.values
    .filter((value) => !value.exists || !value.available)
    .map((value) => value.name);

  return (
    <div className="grid gap-3">
      <p className="type-body text-ink">
        {selectedSize ? `Size — ${selectedSize} selected` : "Size"}
      </p>
      <div aria-label={sizeOption.name} className="grid grid-cols-5 gap-2.5" role="group">
        {sizeOption.values.map((value) => {
          const unavailable = !value.exists || !value.available;
          return (
            <button
              aria-label={`${value.name}${unavailable ? " (unavailable)" : ""}`}
              aria-pressed={value.selected}
              className={cn(
                "type-label focus-ring flex min-h-11 cursor-pointer items-center justify-center border px-1 transition-colors duration-(--motion-fast) ease-(--ease-standard)",
                unavailable
                  ? "cursor-not-allowed border-rule bg-surface text-ink-muted line-through"
                  : value.selected
                    ? "border-ink bg-ink text-inverse"
                    : "border-ink text-ink hover:bg-surface",
              )}
              disabled={unavailable}
              key={value.name}
              onClick={() => selectOption(sizeOption.name, value.name)}
              type="button"
            >
              {value.name}
            </button>
          );
        })}
      </div>
      {unavailableNames.length > 0 ? (
        <p className="type-body-sm text-ink-muted">{unavailableNames.join(", ")} — Unavailable</p>
      ) : null}
      <div className="flex items-center">
        <SizeGuide category={sizeGuideCategory} />
      </div>
    </div>
  );
}

function QuickAddSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-6" role="status">
      <span className="sr-only">Loading sizes</span>
      <div aria-hidden="true" className="grid gap-6">
        <div className="grid gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="grid gap-3">
          <Skeleton className="h-4 w-28" />
          <div className="grid grid-cols-5 gap-2.5">
            {[0, 1, 2, 3, 4].map((value) => (
              <Skeleton className="h-11" key={value} />
            ))}
          </div>
        </div>
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}
