"use client";

import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import {
  findExchangeVariant,
  formatReturnItemOptions,
  getExchangeSelectionLabel,
  getInitialExchangeOptions,
  getReturnReasonOptions,
  isOptionValueAvailable,
} from "@/lib/returns";
import type { ExchangeProduct, ReturnContext, ReturnableItem } from "@/lib/returns/types";

interface ReturnExchangeFormProps {
  context: ReturnContext;
  item: ReturnableItem;
  product: ExchangeProduct;
}

function getReplacementDefaults(
  product: ExchangeProduct,
  item: ReturnableItem,
): Record<string, string> {
  const original = getInitialExchangeOptions(product, item.options);
  const originalVariant = findExchangeVariant(product, original);
  if (originalVariant && !originalVariant.availableForSale) {
    const alternative = product.variants.find(
      (variant) =>
        variant.availableForSale &&
        variant.selectedOptions.some(
          (option) => original[option.name] !== undefined && original[option.name] !== option.value,
        ),
    );
    if (alternative) {
      return Object.fromEntries(
        alternative.selectedOptions.map((option) => [option.name, option.value]),
      );
    }
  }
  if (originalVariant?.availableForSale) {
    const alternative = product.variants.find(
      (variant) =>
        variant.availableForSale &&
        variant.selectedOptions.some(
          (option) => original[option.name] !== undefined && original[option.name] !== option.value,
        ),
    );
    if (alternative) {
      return Object.fromEntries(
        alternative.selectedOptions.map((option) => [option.name, option.value]),
      );
    }
  }
  return original;
}

export function ReturnExchangeForm({ context, item, product }: ReturnExchangeFormProps) {
  const router = useRouter();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() =>
    getReplacementDefaults(product, item),
  );
  const reasons = getReturnReasonOptions(item);
  const [reasonLabel, setReasonLabel] = useState(reasons[0]?.label ?? "");
  const reason = reasons.find((entry) => entry.label === reasonLabel) ?? reasons[0];
  const selectedVariant = findExchangeVariant(product, selectedOptions);
  const selectionLabel = getExchangeSelectionLabel(product, selectedOptions);
  const encodedOrderId = encodeURIComponent(context.orderId);

  function changeOption(name: string, value: string) {
    const next = { ...selectedOptions, [name]: value };
    if (findExchangeVariant(product, next)) {
      setSelectedOptions(next);
      return;
    }
    const fallback = product.variants.find(
      (variant) =>
        variant.availableForSale &&
        variant.selectedOptions.some((option) => option.name === name && option.value === value),
    );
    if (fallback) {
      setSelectedOptions(
        Object.fromEntries(fallback.selectedOptions.map((option) => [option.name, option.value])),
      );
    }
  }

  function continueToDetails() {
    if (!selectedVariant?.availableForSale || !reason) return;
    const params = new URLSearchParams({
      item: item.id,
      reason: reason.label,
      resolution: "exchange",
      replacementLabel: selectionLabel,
      replacementVariantId: selectedVariant.id,
    });
    if (reason.id) params.set("reasonId", reason.id);
    router.push(`/returns/${encodedOrderId}/details?${params.toString()}`);
  }

  const sizeOption = product.options.find((option) => /size/i.test(option.name));
  const unavailableSizes =
    sizeOption?.values.filter(
      (value) => !isOptionValueAvailable(product, selectedOptions, sizeOption.name, value),
    ) ?? [];
  const selectedSize = sizeOption ? selectedOptions[sizeOption.name] : null;

  return (
    <>
      <div className="grid gap-3 border border-ink p-5">
        <p className="type-body text-ink">Exchange · {item.title}</p>
        <p className="type-body-sm text-ink-muted">
          Current: {formatReturnItemOptions(item.options) || item.variantTitle || "—"} ·
          Replacement: {selectedVariant?.availableForSale ? selectionLabel : "Choose an option"}
        </p>
      </div>

      <div className="grid gap-6">
        {product.options.map((option) => {
          if (/size/i.test(option.name)) {
            return (
              <div className="grid gap-3" key={option.name}>
                <span className="type-body-sm text-ink">{option.name}</span>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const available = isOptionValueAvailable(
                      product,
                      selectedOptions,
                      option.name,
                      value,
                    );
                    const selected = selectedOptions[option.name] === value;
                    return (
                      <button
                        aria-label={`${option.name}: ${value}${available ? "" : " (unavailable)"}`}
                        aria-pressed={selected}
                        className={[
                          "type-body-sm flex h-[43px] min-w-14 flex-1 cursor-pointer items-center justify-center border border-ink px-2 transition-colors",
                          selected
                            ? "bg-ink text-inverse"
                            : available
                              ? "bg-paper text-ink hover:bg-surface"
                              : "cursor-not-allowed bg-surface text-ink-muted",
                        ].join(" ")}
                        disabled={!available}
                        key={value}
                        onClick={() => changeOption(option.name, value)}
                        type="button"
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
                {selectedSize || unavailableSizes.length > 0 ? (
                  <p className="type-body-sm text-ink-muted">
                    {[
                      selectedSize ? `${selectedSize} selected` : null,
                      unavailableSizes.length > 0
                        ? `${unavailableSizes.join(", ")} unavailable`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
              </div>
            );
          }

          return (
            <div className="grid gap-2" key={option.name}>
              <label className="type-body-sm text-ink" htmlFor={`exchange-${option.name}`}>
                {option.name}
              </label>
              <div className="relative">
                <select
                  className="type-body-sm h-10 w-full appearance-none border border-ink bg-paper px-4 pr-10 text-ink focus-ring"
                  id={`exchange-${option.name}`}
                  onChange={(event) => changeOption(option.name, event.target.value)}
                  value={selectedOptions[option.name] ?? option.values[0] ?? ""}
                >
                  {option.values.map((value) => (
                    <option
                      disabled={
                        !isOptionValueAvailable(product, selectedOptions, option.name, value)
                      }
                      key={value}
                      value={value}
                    >
                      {value}
                      {isOptionValueAvailable(product, selectedOptions, option.name, value)
                        ? ""
                        : " (unavailable)"}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink"
                />
              </div>
            </div>
          );
        })}

        <div className="grid gap-2">
          <label className="type-body-sm text-ink" htmlFor="exchange-reason">
            Reason for exchange
          </label>
          <div className="relative">
            <select
              className="type-body-sm h-10 w-full appearance-none border border-ink bg-paper px-4 pr-10 text-ink focus-ring"
              id="exchange-reason"
              onChange={(event) => setReasonLabel(event.target.value)}
              value={reasonLabel}
            >
              {reasons.map((entry) => (
                <option key={entry.label} value={entry.label}>
                  {entry.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 border border-ink p-5">
        <p className="type-body text-ink">Replacement availability</p>
        <p className="type-body-sm text-ink-muted">
          Availability is checked again before the exchange is confirmed. Dispatch follows
          acceptance of the returned item.
        </p>
      </div>

      <Button
        className="w-full"
        disabled={!selectedVariant?.availableForSale || !reason}
        onClick={continueToDetails}
        size="lg"
      >
        Continue with {selectedVariant?.availableForSale ? selectionLabel : "a replacement"}
      </Button>

      <Link
        className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink hover:underline"
        href={`/returns/${encodedOrderId}/details?item=${encodeURIComponent(item.id)}&resolution=return`}
      >
        Choose return instead
      </Link>
    </>
  );
}
