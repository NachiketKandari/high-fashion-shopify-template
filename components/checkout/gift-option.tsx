"use client";

import { cn } from "cn";
import { useRef, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { useCart, useCartForm } from "@/lib/cart/client";
import type { Cart } from "@/lib/cart/types";
import { GIFT_ATTRIBUTE, GIFT_NOTE_ATTRIBUTE } from "@/lib/checkout";

interface GiftOptionProps {
  cart: Cart;
  className?: string;
}

export function GiftOption({ cart, className }: GiftOptionProps) {
  const { formProps, register } = useCartForm();
  const isPending = useCart((state) => state.pending.attributes);
  const attributeErrors = useCart((state) => state.errors.attributes);
  const attributes = cart.attributes ?? [];
  const isGift = attributes.find((attribute) => attribute.key === GIFT_ATTRIBUTE)?.value === "true";
  const savedNote =
    attributes.find((attribute) => attribute.key === GIFT_NOTE_ATTRIBUTE)?.value ?? "";
  const form = useRef<HTMLFormElement>(null);
  const submit = useRef<HTMLButtonElement>(null);
  const giftValue = useRef<HTMLInputElement>(null);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const otherAttributes = attributes.filter(
    (attribute) => attribute.key !== GIFT_ATTRIBUTE && attribute.key !== GIFT_NOTE_ATTRIBUTE,
  );
  const error = Array.from(attributeErrors.values())
    .flatMap((group) => group.userErrors)
    .find((userError) => userError.field?.includes(GIFT_ATTRIBUTE))?.message;

  return (
    <form
      aria-busy={isPending || undefined}
      className={cn("grid gap-3 border border-ink px-4 py-6", className)}
      ref={form}
      {...formProps()}
    >
      {otherAttributes.map((attribute) => (
        <input
          key={attribute.key}
          type="hidden"
          {...register("attributeValue", {
            key: attribute.key,
            value: attribute.value ?? "",
          })}
        />
      ))}
      <input
        ref={giftValue}
        type="hidden"
        {...register("attributeValue", { key: GIFT_ATTRIBUTE, value: isGift ? "true" : "false" })}
      />
      <button
        {...register("attributes-update")}
        aria-hidden="true"
        className="sr-only"
        ref={submit}
        tabIndex={-1}
        type="submit"
      />

      <Checkbox
        checked={isGift}
        className="type-meta min-h-0 text-ink"
        disabled={isPending}
        label="Make this order a gift"
        onCheckedChange={(nextGift) => {
          if (giftValue.current) giftValue.current.value = nextGift ? "true" : "false";
          if (submit.current) form.current?.requestSubmit(submit.current);
        }}
      />

      <div className={cn("grid gap-3", !isGift && "hidden")}>
        <p className="type-meta whitespace-pre-line text-ink">
          {
            "Hide the price tag\nSeparates recipient delivery phone from buyer contact\nGift Wrapping"
          }
        </p>
        {isNoteOpen || savedNote ? (
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="sr-only">Gift note</span>
              <textarea
                className="type-meta min-h-16 w-full resize-y border border-ink bg-transparent px-4 py-3 placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                key={savedNote}
                placeholder="Add a note"
                {...register("attributeValue", {
                  key: GIFT_NOTE_ATTRIBUTE,
                  defaultValue: savedNote,
                })}
              />
            </label>
            <div className="flex min-h-9 items-center justify-between gap-4">
              <button
                {...register("attributes-update")}
                className="type-meta-medium focus-ring cursor-pointer underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isPending}
                type="submit"
              >
                Save note
              </button>
              <span className="type-meta text-ink-muted">
                {savedNote ? "Note saved" : "Optional"}
              </span>
            </div>
          </div>
        ) : (
          <button
            className="type-meta-medium focus-ring h-10.5 w-full cursor-pointer rounded-control border border-ink bg-paper transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isPending}
            onClick={() => setIsNoteOpen(true)}
            type="button"
          >
            Add a note
          </button>
        )}
      </div>

      {error ? (
        <p className="type-meta text-error-rule" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
