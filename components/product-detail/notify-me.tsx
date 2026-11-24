"use client";

import { cn } from "cn";
import { X } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";

import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Image as ImageType } from "@/lib/media/types";
import type { Money } from "@/lib/money/types";

export interface NotifyMeProduct {
  image?: ImageType | null;
  price: Money;
  title: string;
}

export interface NotifyMeSizeOption {
  name: string;
  values: string[];
}

interface NotifyMeProps {
  product: NotifyMeProduct;
  selectedSize?: string;
  sizeOption?: NotifyMeSizeOption;
  triggerAriaLabel?: string;
  triggerClassName?: string;
  triggerLabel?: string;
}

export function NotifyMe({
  product,
  selectedSize,
  sizeOption,
  triggerAriaLabel,
  triggerClassName,
  triggerLabel = "Notify me when available",
}: NotifyMeProps) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(selectedSize ?? "");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const emailId = useId();

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setSize(selectedSize ?? "");
          setSubmitted(false);
          return;
        }
        setEmail("");
        setSubmitted(false);
      }}
    >
      <SheetTrigger
        render={
          <button
            aria-label={triggerAriaLabel}
            className={cn(
              "type-control focus-ring flex w-full cursor-pointer items-center justify-center border border-ink bg-transparent px-5 text-ink transition-colors hover:bg-surface",
              triggerClassName ?? "h-[50px]",
            )}
            type="button"
          >
            {triggerLabel}
          </button>
        }
      />
      <SheetContent
        className="w-(--drawer-size) max-w-full gap-0 border-l border-rule p-0"
        closeButton={false}
        side="right"
      >
        <div className="flex h-18 shrink-0 items-center justify-between px-6">
          <SheetTitle className="type-h3">Notify me</SheetTitle>
          <SheetClose
            aria-label="Close notify me"
            className="focus-ring flex size-9 items-center justify-center"
            type="button"
          >
            <X className="size-4" strokeWidth={1.25} />
          </SheetClose>
        </div>
        <SheetDescription className="sr-only">
          Ask to be notified when this piece is back in stock.
        </SheetDescription>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            // TODO(notify-me): a restock-list provider replaces this local confirmation; see docs/STUBS.md.
            setSubmitted(true);
          }}
        >
          <div className="grid flex-1 content-start gap-8 overflow-y-auto px-6 py-6">
            {submitted ? (
              <div className="grid gap-3" role="status">
                <p className="type-h3">You&apos;re on the list</p>
                <p className="type-body-sm text-ink-muted">
                  We&apos;ll email {email} when {size ? `size ${size} is` : "this piece is"} back in
                  stock.
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-6">
                  <div className="relative aspect-[123/191] w-[123px] shrink-0 overflow-hidden border border-rule">
                    {product.image ? (
                      <Image
                        alt=""
                        className="object-cover"
                        fill
                        sizes="100vw"
                        src={product.image.url}
                      />
                    ) : (
                      <ImagePlaceholder className="size-full" />
                    )}
                  </div>
                  <div className="grid content-start gap-2">
                    <p className="type-meta-semibold text-ink">{product.title}</p>
                    {size ? <p className="type-label text-ink-muted">size {size}</p> : null}
                    <Price
                      amount={product.price.amount}
                      className="type-label"
                      currencyCode={product.price.currencyCode}
                    />
                  </div>
                </div>

                {sizeOption && sizeOption.values.length > 1 ? (
                  <div className="grid gap-3">
                    <span className="type-control text-ink">select size (optional)</span>
                    <div aria-label={sizeOption.name} className="flex flex-wrap gap-3" role="group">
                      {sizeOption.values.map((value) => {
                        const selected = size === value;
                        return (
                          <button
                            aria-pressed={selected}
                            className="group focus-ring inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center"
                            key={value}
                            onClick={() => setSize(selected ? "" : value)}
                            type="button"
                          >
                            <span
                              className={cn(
                                "type-label inline-flex items-center justify-center border px-1.5 transition-colors desktop:h-11 desktop:px-4",
                                selected
                                  ? "border-ink bg-ink text-inverse"
                                  : "border-rule text-ink-muted group-hover:border-ink group-hover:text-ink",
                              )}
                            >
                              {value}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-2.5">
                  <Label className="type-control" htmlFor={emailId}>
                    enter your email address to be notified
                  </Label>
                  <Input
                    autoComplete="email"
                    className="h-[49px]"
                    id={emailId}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="E-mail address"
                    required
                    type="email"
                    value={email}
                  />
                  <p className="type-body-sm text-ink-muted">
                    See our{" "}
                    <Link
                      className="focus-ring underline underline-offset-2 transition-colors hover:text-ink"
                      href="/pages/privacy-policies"
                    >
                      Privacy Policy
                    </Link>{" "}
                    for how we use your email.
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="shrink-0 border-t border-rule p-6">
            {submitted ? (
              <SheetClose
                render={<Button className="h-[53px] w-full" variant="outline" />}
                type="button"
              >
                Close
              </SheetClose>
            ) : (
              <Button className="h-[53px] w-full" type="submit">
                Notify me
              </Button>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
