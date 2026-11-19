"use client";

import { cn } from "cn";
import { ChevronDownIcon, XIcon } from "lucide-react";
import Image from "next/image";

import { Price } from "@/components/product/price";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import { useCart, useCartForm } from "@/lib/cart/client";
import type { Cart, CartLine } from "@/lib/cart/types";

interface CheckoutItemsProps {
  cart: Cart;
  className?: string;
}

export function CheckoutItems({ cart, className }: CheckoutItemsProps) {
  return (
    <details className={cn("group border-y border-ink", className)}>
      <summary className="type-body-sm flex h-[49px] cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        ITEMS
        <ChevronDownIcon
          aria-hidden="true"
          className="size-3 transition-transform group-open:rotate-180"
        />
      </summary>
      <ul aria-label="Order items" className="grid gap-6 pb-6">
        {cart.lines.nodes.map((line) => (
          <CheckoutItem key={line.id} line={line} />
        ))}
      </ul>
    </details>
  );
}

function CheckoutItem({ line }: { line: CartLine }) {
  const isPending = useCart((state) => state.pending.lines.has(line.id));
  const { formProps, register } = useCartForm();
  const { cost, merchandise, quantity } = line;
  const instructions = "instructions" in line ? line.instructions : undefined;
  const canUpdateQuantity = !(
    instructions &&
    typeof instructions === "object" &&
    "canUpdateQuantity" in instructions &&
    instructions.canUpdateQuantity === false
  );
  const canRemove = !(
    instructions &&
    typeof instructions === "object" &&
    "canRemove" in instructions &&
    instructions.canRemove === false
  );
  const title = merchandise?.product.title || "Cart item";
  const variantLabel = merchandise?.selectedOptions?.length
    ? merchandise.selectedOptions
        .filter((option) => option.value !== "Default Title")
        .map((option) => `${option.name.toLowerCase()} ${option.value}`)
        .join(" · ")
    : "";
  const href = merchandise?.product.handle ? `/products/${merchandise.product.handle}` : undefined;
  const image = merchandise?.image;
  const imageContent = image?.url ? (
    <Image
      alt={image.altText || title}
      className="object-cover"
      fill
      sizes="100vw"
      src={image.url}
    />
  ) : (
    <ImagePlaceholder className="size-full" />
  );

  return (
    <li aria-busy={isPending || undefined} className="flex gap-6">
      {href ? (
        <Link
          className="relative h-[191px] w-[123px] shrink-0 overflow-hidden bg-surface transition-opacity hover:opacity-80"
          href={href}
        >
          {imageContent}
        </Link>
      ) : (
        <div className="relative h-[191px] w-[123px] shrink-0 overflow-hidden bg-surface">
          {imageContent}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="grid min-w-0 gap-1">
            {href ? (
              <Link
                className="type-control focus-ring line-clamp-2 w-fit hover:opacity-70"
                href={href}
              >
                {title}
              </Link>
            ) : (
              <p className="type-control line-clamp-2">{title}</p>
            )}
            {variantLabel ? <p className="type-body-sm text-ink-muted">{variantLabel}</p> : null}
          </div>
          {canRemove ? (
            <form {...formProps()}>
              <input type="hidden" {...register("lineId", { value: line.id })} />
              <button
                {...register("remove")}
                aria-label={`Remove ${title}`}
                className="focus-ring flex size-9 shrink-0 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isPending}
                type="submit"
              >
                <XIcon aria-hidden="true" className="size-3" />
              </button>
            </form>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {canUpdateQuantity ? (
            <form
              aria-label={`Quantity for ${title}`}
              className="flex items-center gap-4"
              role="group"
              {...formProps()}
            >
              <input type="hidden" {...register("lineId", { value: line.id })} />
              <input type="hidden" {...register("quantity", { value: quantity })} />
              <button
                {...register("decrease")}
                aria-label={`Decrease quantity: ${title}`}
                className="type-body-sm focus-ring flex size-9 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isPending || quantity <= 1}
                type="submit"
              >
                -
              </button>
              <span aria-live="polite" className="type-body-sm min-w-3 text-center tabular-nums">
                {quantity}
              </span>
              <button
                {...register("increase")}
                aria-label={`Increase quantity: ${title}`}
                className="type-body-sm focus-ring flex size-9 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isPending || quantity >= 99}
                type="submit"
              >
                +
              </button>
            </form>
          ) : (
            <p className="type-body-sm text-ink-muted">Quantity {quantity}</p>
          )}
          <Price
            amount={cost.totalAmount.amount}
            className="type-body-sm"
            currencyCode={cost.totalAmount.currencyCode}
          />
        </div>
      </div>
    </li>
  );
}
