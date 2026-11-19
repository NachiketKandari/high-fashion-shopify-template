"use client";

import { cn } from "cn";

import { Input } from "@/components/ui/input";
import { DELIVERY_FIELDS, getAddressSummary } from "@/lib/checkout";
import type { DeliveryDraft, DeliveryErrors, DeliverySelection } from "@/lib/checkout/types";
import type { CustomerAddress } from "@/lib/customer/types";

interface AddressStepProps {
  addresses: CustomerAddress[];
  className?: string;
  errors: DeliveryErrors;
  onChange: (selection: DeliverySelection) => void;
  selection: DeliverySelection;
}

export function AddressStep({
  addresses,
  className,
  errors,
  onChange,
  selection,
}: AddressStepProps) {
  const showForm = selection.mode === "new" || addresses.length === 0;
  const updateDraft = (field: keyof DeliveryDraft, value: string) =>
    onChange({ ...selection, draft: { ...selection.draft, [field]: value } });

  return (
    <section aria-label="Delivery address" className={cn("grid gap-8", className)}>
      {addresses.length > 0 ? (
        <div className="grid gap-8">
          <h2 className="type-h4 text-ink-strong">Choose Address</h2>
          <div className="grid gap-8">
            {addresses.map((address) => {
              const isSelected = selection.mode === "saved" && selection.addressId === address.id;
              return (
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    "focus-ring grid w-full max-w-[453px] cursor-pointer gap-4 border bg-paper p-6 text-left transition-colors",
                    isSelected ? "border-ink" : "border-ink/40 hover:border-ink",
                  )}
                  key={address.id}
                  onClick={() =>
                    onChange({ addressId: address.id, draft: selection.draft, mode: "saved" })
                  }
                  type="button"
                >
                  <span className="type-meta text-ink-strong">
                    {[address.firstName, address.lastName].filter(Boolean).join(" ")}
                  </span>
                  <span className="type-meta whitespace-pre-line text-ink-strong">
                    {getAddressSummary(address).join("\n")}
                  </span>
                </button>
              );
            })}
            <button
              aria-pressed={selection.mode === "new"}
              className={cn(
                "focus-ring flex h-16.5 w-full max-w-[453px] cursor-pointer items-center border bg-paper px-6 text-left transition-colors",
                selection.mode === "new" ? "border-ink" : "border-ink/40 hover:border-ink",
              )}
              onClick={() => onChange({ ...selection, mode: "new" })}
              type="button"
            >
              <span className="type-meta">Add new address</span>
            </button>
          </div>
        </div>
      ) : null}

      {showForm ? (
        <div className="grid gap-4">
          <div className="flex min-h-9 items-center justify-between gap-4">
            <h2 className="type-meta-bold text-ink-strong">Delivery Detail</h2>
            {addresses.length > 0 ? (
              <button
                className="type-meta-medium focus-ring cursor-pointer text-ink-muted hover:underline"
                onClick={() =>
                  onChange({ addressId: addresses[0].id, draft: selection.draft, mode: "saved" })
                }
                type="button"
              >
                Use saved address
              </button>
            ) : null}
          </div>

          <div className="grid gap-4">
            {DELIVERY_FIELDS.map((field) => {
              const id = `checkout-${field.key}`;
              const error = errors[field.key];
              return (
                <div className="grid gap-1" key={field.key}>
                  <label className="sr-only" htmlFor={id}>
                    {field.label}
                  </label>
                  {field.key === "phone" ? (
                    <div
                      className={cn(
                        "flex h-[41px] w-[300px] max-w-full items-center gap-6 border-0 border-b bg-transparent px-6 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink",
                        error ? "border-error-rule" : "border-ink",
                      )}
                    >
                      <span aria-hidden="true" className="type-control">
                        +91
                      </span>
                      <Input
                        aria-describedby={error ? `${id}-error` : undefined}
                        aria-invalid={error ? true : undefined}
                        autoComplete={field.autoComplete}
                        className="type-meta-medium h-full w-full border-0 px-0 py-0 focus-visible:outline-none"
                        id={id}
                        inputMode="numeric"
                        maxLength={10}
                        onChange={(event) => updateDraft(field.key, event.target.value)}
                        placeholder={field.placeholder}
                        value={selection.draft[field.key]}
                      />
                    </div>
                  ) : (
                    <Input
                      aria-describedby={error ? `${id}-error` : undefined}
                      aria-invalid={error ? true : undefined}
                      autoComplete={field.autoComplete}
                      className="type-meta-medium h-[41px] w-[300px] max-w-full rounded-none border-0 border-b border-ink px-6 py-3 focus-visible:outline-offset-4"
                      id={id}
                      inputMode={field.key === "postcode" ? "numeric" : undefined}
                      maxLength={field.key === "postcode" ? 6 : undefined}
                      onChange={(event) => updateDraft(field.key, event.target.value)}
                      placeholder={field.placeholder}
                      value={selection.draft[field.key]}
                    />
                  )}
                  {error ? (
                    <p className="type-meta text-error-rule" id={`${id}-error`} role="alert">
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
