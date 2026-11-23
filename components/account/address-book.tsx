"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getAddressLabel, getAddressName, maskPhone } from "@/lib/customer";
import {
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  updateAddressAction,
} from "@/lib/customer/action";
import type { CustomerAddress, CustomerAddressInput } from "@/lib/customer/types";

type FormState = { address: CustomerAddress; mode: "edit" } | { mode: "create" } | null;

const TEXT_FIELDS = [
  { autoComplete: "given-name", key: "firstName", label: "First name", span: false },
  { autoComplete: "family-name", key: "lastName", label: "Last name", span: false },
  { autoComplete: "organization", key: "company", label: "Company", span: true },
  { autoComplete: "address-line1", key: "address1", label: "Address", span: true },
  { autoComplete: "address-line2", key: "address2", label: "Apartment, suite, etc.", span: true },
  { autoComplete: "address-level2", key: "city", label: "City", span: false },
  { autoComplete: "address-level1", key: "zoneCode", label: "State / Province code", span: false },
  { autoComplete: "postal-code", key: "zip", label: "ZIP / Postal code", span: false },
  { autoComplete: "country", key: "countryCode", label: "Country code", span: false },
  { autoComplete: "tel", key: "phoneNumber", label: "Phone", span: true },
] as const satisfies readonly {
  autoComplete: string;
  key: keyof CustomerAddressInput;
  label: string;
  span: boolean;
}[];

const REQUIRED_FIELDS = new Set<keyof CustomerAddressInput>(["address1", "city", "countryCode"]);

export function AddressBook({ addresses }: { addresses: CustomerAddress[] }) {
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerAddress | null>(null);

  return (
    <div className="grid gap-6">
      {addresses.length === 0 ? (
        <div className="grid gap-4 border border-rule p-6">
          <p className="type-h4 text-ink">No saved addresses yet</p>
          <p className="type-body-sm text-ink-muted">Add an address to make checkout faster.</p>
        </div>
      ) : (
        <ul className="grid gap-6 desktop:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              address={address}
              canRemove={!address.isDefault || addresses.length > 1}
              key={address.id}
              onDelete={setDeleteTarget}
              onEdit={(target) => setFormState({ address: target, mode: "edit" })}
            />
          ))}
        </ul>
      )}

      <Button
        className="w-full"
        onClick={() => setFormState({ mode: "create" })}
        size="lg"
        variant="outline"
      >
        Add New Address
      </Button>

      <p className="type-body-sm text-ink-muted">Updates apply to future orders.</p>

      <Dialog open={formState !== null} onOpenChange={(open) => !open && setFormState(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto tablet:max-w-xl">
          <DialogHeader>
            <DialogTitle>{formState?.mode === "edit" ? "Edit address" : "Add address"}</DialogTitle>
          </DialogHeader>
          {formState !== null ? (
            <AddressForm
              address={formState.mode === "edit" ? formState.address : undefined}
              key={formState.mode === "edit" ? formState.address.id : "create"}
              onSuccess={() => setFormState(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteDialog
        fallbackDefaultId={
          deleteTarget
            ? (addresses.find((address) => address.id !== deleteTarget.id)?.id ?? null)
            : null
        }
        key={deleteTarget?.id ?? "none"}
        onClose={() => setDeleteTarget(null)}
        target={deleteTarget}
      />
    </div>
  );
}

function AddressCard({
  address,
  canRemove,
  onDelete,
  onEdit,
}: {
  address: CustomerAddress;
  canRemove: boolean;
  onDelete: (address: CustomerAddress) => void;
  onEdit: (address: CustomerAddress) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSetDefault() {
    setError(null);
    startTransition(async () => {
      const result = await setDefaultAddressAction(address.id);
      if (!result.success) {
        setError(result.error ?? "Failed to set the default address");
      }
    });
  }

  return (
    <li className="grid content-start gap-4 border border-rule p-6">
      <p className="type-h4 text-ink">{getAddressLabel(address)}</p>
      <div className="type-body-sm grid gap-2 text-ink-muted">
        <p>{getAddressName(address)}</p>
        <address className="grid gap-1 not-italic">
          {address.formatted.map((line, index) => (
            <span key={index}>{line}</span>
          ))}
        </address>
        {address.phoneNumber ? <p>{maskPhone(address.phoneNumber)}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {address.isDefault ? null : (
          <>
            <button
              className="type-body-sm focus-ring inline-flex min-h-9 cursor-pointer items-center text-ink underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
              onClick={handleSetDefault}
              type="button"
            >
              {isPending ? "Saving…" : "Set as default"}
            </button>
            <span aria-hidden="true" className="type-body-sm text-ink-muted">
              /
            </span>
          </>
        )}
        <button
          className="type-body-sm focus-ring inline-flex min-h-9 cursor-pointer items-center text-ink underline-offset-4 hover:underline"
          onClick={() => onEdit(address)}
          type="button"
        >
          Edit
        </button>
        {canRemove ? (
          <>
            <span aria-hidden="true" className="type-body-sm text-ink-muted">
              /
            </span>
            <button
              className="type-body-sm focus-ring inline-flex min-h-9 cursor-pointer items-center text-ink underline-offset-4 hover:underline"
              onClick={() => onDelete(address)}
              type="button"
            >
              Remove
            </button>
          </>
        ) : null}
      </div>
      {error ? (
        <p className="type-body-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}

function AddressForm({ address, onSuccess }: { address?: CustomerAddress; onSuccess: () => void }) {
  const [values, setValues] = useState<CustomerAddressInput>(() => toFormValues(address));
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const isCurrentDefault = address?.isDefault ?? false;
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = address
        ? await updateAddressAction(address.id, values, isDefault)
        : await createAddressAction(values, isDefault);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error ?? null);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  };
  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 tablet:grid-cols-2">
        {TEXT_FIELDS.map((field) => {
          const fieldError = fieldErrors[field.key];
          return (
            <div
              className={field.span ? "grid gap-1.5 tablet:col-span-2" : "grid gap-1.5"}
              key={field.key}
            >
              <Label htmlFor={field.key}>
                {field.label}
                {REQUIRED_FIELDS.has(field.key) ? <span aria-hidden="true"> *</span> : null}
              </Label>
              <Input
                aria-invalid={fieldError ? true : undefined}
                autoComplete={field.autoComplete}
                id={field.key}
                name={field.key}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                }
                placeholder={
                  field.key === "countryCode"
                    ? "e.g. IN"
                    : field.key === "zoneCode"
                      ? "e.g. MH"
                      : undefined
                }
                required={REQUIRED_FIELDS.has(field.key)}
                value={values[field.key] ?? ""}
              />
              {fieldError ? (
                <p className="type-body-sm text-error-rule" role="alert">
                  {fieldError}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4 border border-rule p-3">
        <Label htmlFor="isDefault">Set as default address</Label>
        <Switch
          checked={isDefault}
          disabled={isCurrentDefault}
          id="isDefault"
          onCheckedChange={setIsDefault}
        />
      </div>

      {error ? (
        <p className="type-body-sm text-error-rule" role="alert">
          {error}
        </p>
      ) : null}

      <DialogFooter>
        <Button disabled={isPending} type="submit">
          {isPending ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function DeleteDialog({
  fallbackDefaultId,
  onClose,
  target,
}: {
  fallbackDefaultId: string | null;
  onClose: () => void;
  target: CustomerAddress | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const handleDelete = () => {
    if (!target) return;
    setError(null);
    startTransition(async () => {
      if (target.isDefault && fallbackDefaultId) {
        const defaultResult = await setDefaultAddressAction(fallbackDefaultId);
        if (!defaultResult.success) {
          setError(defaultResult.error ?? "Failed to set another default address");
          return;
        }
      }

      const result = await deleteAddressAction(target.id);
      if (result.success) {
        onClose();
      } else {
        setError(result.error ?? null);
      }
    });
  };
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete address?</DialogTitle>
          <DialogDescription>
            This address will be permanently removed from your account.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p className="type-body-sm text-error-rule" role="alert">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <Button disabled={isPending} onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button disabled={isPending} onClick={handleDelete} variant="destructive">
            {isPending ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function toFormValues(address?: CustomerAddress): CustomerAddressInput {
  return {
    address1: address?.address1 ?? "",
    address2: address?.address2 ?? "",
    city: address?.city ?? "",
    company: address?.company ?? "",
    countryCode: address?.countryCode ?? "",
    firstName: address?.firstName ?? "",
    lastName: address?.lastName ?? "",
    phoneNumber: address?.phoneNumber ?? "",
    zip: address?.zip ?? "",
    zoneCode: address?.zoneCode ?? "",
  };
}
