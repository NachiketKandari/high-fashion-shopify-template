"use client";

import type { CartLine as HydrogenCartLine } from "@shopify/hydrogen";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";

import { Price } from "@/components/product/price";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import { useCart } from "@/lib/cart/client";
import type { CartLine } from "@/lib/cart/types";

import { CartLineForm } from "./line-form";
import { CartWarnings } from "./warnings";

interface CartLineItemsProps {
  lines: CartLine[];
}

export function CartLineItems({ lines }: CartLineItemsProps) {
  const visibleLines = lines.filter((line) => line.quantity > 0);
  const keys = getLineRowKeys(visibleLines);
  return (
    <ul aria-label="Cart items" className="grid gap-8">
      {visibleLines.map((line, index) => (
        <CartLineItem item={line} key={keys[index]} />
      ))}
    </ul>
  );
}

// Shopify replaces a new line's `optimistic:` ID on confirmation, so rows key by the identity Hydrogen matches lines on.
function getLineRowKeys(lines: CartLine[]) {
  const keys = lines.map((line) =>
    JSON.stringify([
      line.merchandise?.id ?? line.id,
      line.sellingPlanAllocation?.sellingPlan.id ?? null,
      (line.attributes ?? []).map(({ key, value }) => JSON.stringify([key, value])).sort(),
    ]),
  );
  return keys.map((key, index) =>
    keys.indexOf(key) === keys.lastIndexOf(key) ? key : lines[index].id,
  );
}

interface CartLineItemProps {
  item: CartLine;
}

function CartLineItem({ item }: CartLineItemProps) {
  const isPending = useCart((state) => state.pending.lines.has(item.id));
  const { cost, merchandise, quantity } = item;
  const instructions = "instructions" in item ? item.instructions : undefined;
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
  const isOutOfStock = !canUpdateQuantity;
  const components = (item as HydrogenCartLine).lineComponents ?? [];
  const isOptimistic = item.id.startsWith("optimistic:");
  const amount = cost.totalAmount.amount;
  const currencyCode = cost.totalAmount.currencyCode;
  const canShowPrice = Boolean(currencyCode) && amount !== "";
  const productTitle = merchandise?.product.title || "Cart item";
  const optionValues = (merchandise?.selectedOptions ?? []).filter(
    (option) => option.value !== "Default Title",
  );
  const colourOption = optionValues.find((option) => /colou?r/i.test(option.name));
  const secondaryOptions = optionValues.filter((option) => option !== colourOption);
  const sizeOption = secondaryOptions.find((option) => /size/i.test(option.name));
  const title = colourOption ? `${productTitle} - ${colourOption.value}` : productTitle;
  const variantLabel = secondaryOptions.map((option) => option.value).join(" · ");
  const lineName = variantLabel ? `${title}, ${variantLabel}` : title;
  const href = merchandise?.product.handle ? `/products/${merchandise.product.handle}` : undefined;
  const image = merchandise?.image;
  const imageContent = image?.url ? (
    <Image
      alt={image.altText || productTitle}
      className="object-cover"
      fill
      sizes="100vw"
      src={image.url}
    />
  ) : (
    <ImagePlaceholder className="size-full" />
  );
  const imageClass = "relative h-[191px] w-[123px] shrink-0 self-start overflow-hidden bg-surface";

  return (
    <li
      aria-busy={isPending || undefined}
      aria-label={title}
      className="flex gap-6 transition-opacity data-[pending=true]:opacity-60"
      data-pending={isPending || undefined}
    >
      {href ? (
        <Link aria-label={`View ${title}`} className={`${imageClass} focus-ring`} href={href}>
          {imageContent}
        </Link>
      ) : (
        <div className={imageClass}>{imageContent}</div>
      )}
      <CartLineForm
        className="flex min-w-0 flex-1 flex-col gap-4 self-start py-6"
        lineId={item.id}
        minQuantity={canRemove ? 0 : 1}
      >
        {(register) => (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="grid min-w-0 gap-2">
                {href ? (
                  <Link className="focus-ring -my-2.5 flex min-h-9 w-fit items-center" href={href}>
                    <h3 className="type-meta-semibold line-clamp-2">{title}</h3>
                  </Link>
                ) : (
                  <h3 className="type-meta-semibold -my-2.5 flex min-h-9 items-center">{title}</h3>
                )}
                {variantLabel ? (
                  <p className="type-label text-ink">
                    {sizeOption ? <span className="desktop:hidden">size </span> : null}
                    {variantLabel}
                  </p>
                ) : null}
                <div className="type-label hidden tabular-nums text-ink desktop:block">
                  {canShowPrice ? (
                    <Price amount={amount} className="type-label" currencyCode={currencyCode} />
                  ) : (
                    <span className="text-ink-muted">Updating…</span>
                  )}
                </div>
                {item.sellingPlanAllocation ? (
                  <p className="type-label text-ink-muted">
                    {item.sellingPlanAllocation.sellingPlan.name || "Subscription"}
                  </p>
                ) : null}
                {components.length ? (
                  <div className="grid gap-1">
                    <p className="type-label text-ink-muted">Bundle includes</p>
                    <ul className="grid gap-0.5">
                      {components.map((component) => (
                        <li
                          className="type-label flex items-center gap-1.5 text-ink-muted"
                          key={component.id}
                        >
                          <span className="truncate">
                            {component.merchandise?.product.title || "Bundle item"}
                          </span>
                          {component.quantity > 1 ? <span>×{component.quantity}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {isOutOfStock ? (
                  <div className="grid gap-1">
                    <p className="type-control text-error-rule">Out of stock</p>
                    <Link
                      className="type-label focus-ring w-fit underline underline-offset-4"
                      href="/pages/contact-us"
                    >
                      Contact us to order
                    </Link>
                  </div>
                ) : null}
              </div>
              {canRemove ? (
                <button
                  {...register("remove")}
                  aria-label={`Remove ${lineName}`}
                  className="focus-ring flex min-h-9 min-w-9 shrink-0 cursor-pointer items-start justify-center px-0 text-ink transition-colors hover:text-ink-muted disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isOptimistic}
                  type="submit"
                >
                  <span className="type-meta-bold hidden desktop:inline">remove</span>
                  <Trash2Icon
                    aria-hidden="true"
                    className="size-4 desktop:hidden"
                    strokeWidth={1.25}
                  />
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div aria-label="Item quantity" className="flex items-center" role="group">
                <button
                  {...register("decrease")}
                  aria-label={`Decrease quantity: ${lineName}`}
                  className="type-body focus-ring flex size-9 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isOptimistic || !canUpdateQuantity || quantity <= 1}
                  type="submit"
                >
                  -
                </button>
                <input
                  key={quantity}
                  {...register("quantity", { interactive: true, value: quantity })}
                  aria-label={`Quantity: ${lineName}`}
                  className="type-body h-9 w-8 bg-transparent text-center tabular-nums focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink disabled:cursor-not-allowed"
                  disabled={isOptimistic || !canUpdateQuantity}
                  max={99}
                  min={canRemove ? 0 : 1}
                />
                <button
                  {...register("increase")}
                  aria-label={`Increase quantity: ${lineName}`}
                  className="type-body focus-ring flex size-9 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isOptimistic || !canUpdateQuantity || quantity >= 99}
                  type="submit"
                >
                  +
                </button>
              </div>
              <div className="type-label tabular-nums text-ink desktop:hidden">
                {canShowPrice ? (
                  <Price amount={amount} className="type-label" currencyCode={currencyCode} />
                ) : (
                  <span className="text-ink-muted">Updating…</span>
                )}
              </div>
            </div>
            <CartWarnings lineId={item.id} />
          </>
        )}
      </CartLineForm>
    </li>
  );
}
