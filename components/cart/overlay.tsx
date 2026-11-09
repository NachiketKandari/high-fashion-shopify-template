"use client";

import type { CartData } from "@shopify/hydrogen";
import { Loader2, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { useDisplayPrice } from "@/components/currency/provider";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/cart";
import { useCart } from "@/lib/cart/client";

import { useCartDrawer } from "./context";
import { CartLineItems } from "./line-item";
import { CartSummary } from "./summary";
import { CartWarnings } from "./warnings";

interface CartOverlayProps {
  description: string;
  title: string;
}

export function CartOverlay({ description, title }: CartOverlayProps) {
  const { isOverlayOpen, setOverlayOpen } = useCartDrawer();
  const quantity = useCart((state) => state.data.totalQuantity);

  return (
    <Sheet open={isOverlayOpen} onOpenChange={setOverlayOpen}>
      <SheetContent
        className="w-(--drawer-cart) max-w-full gap-0 border-l border-rule p-0"
        closeButton={false}
        side="right"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-rule px-(--gutter)">
          <SheetTitle>
            {title} ({quantity})
          </SheetTitle>
          <SheetClose
            aria-label="Close cart"
            className="flex size-9 items-center justify-center"
            type="button"
          >
            <XIcon className="size-4" strokeWidth={1.25} />
          </SheetClose>
        </div>
        <SheetDescription className="sr-only">{description}</SheetDescription>
        <OverlayContent />
      </SheetContent>
    </Sheet>
  );
}

function OverlayContent() {
  const router = useRouter();
  const cart = useCart((state) => state.data);
  const isLoading = useCart((state) => state.loading);
  const { setOverlayOpen } = useCartDrawer();

  if (isLoading && cart.lines.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center gap-2.5" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading cart…
      </div>
    );
  }

  if (cart.lines.nodes.length === 0) {
    return (
      <div className="flex h-full flex-col px-(--gutter)">
        <CartWarnings />
        <div className="flex flex-1 flex-col justify-start gap-4 pt-8">
          <h3 className="type-h3">Your shopping cart is empty</h3>
          <p className="type-body-sm max-w-[30ch] text-ink-muted">
            Browse our latest collection or check your saved favorites to add more items to your
            cart.
          </p>
          <Button
            className="mt-2 w-fit"
            onClick={() => {
              setOverlayOpen(false);
              router.push("/collections/all");
            }}
            variant="outline"
          >
            Explore collections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <FreeShippingProgress cart={cart} />
      <div className="grid flex-1 content-start gap-6 overflow-y-auto px-(--gutter) py-5">
        <CartWarnings />
        <CartLineItems lines={cart.lines.nodes} />
      </div>
      <footer className="grid gap-3 border-t border-rule px-(--gutter) py-4">
        <CartSummary cart={cart} />
        <Link
          className="type-control focus-ring flex h-9 items-center justify-self-center underline underline-offset-4"
          href="/cart"
          onClick={() => setOverlayOpen(false)}
        >
          View shopping cart
        </Link>
      </footer>
    </div>
  );
}

function FreeShippingProgress({ cart }: { cart: CartData }) {
  const format = useDisplayPrice();
  const subtotal = Number(cart.cost.subtotalAmount.amount);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="grid gap-2 border-b border-rule px-(--gutter) py-3">
      <div
        aria-label="Free shipping progress"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(progress)}
        className="h-px w-full bg-rule"
        role="progressbar"
      >
        <div
          className="h-px bg-ink transition-[width] duration-(--motion-long) ease-(--ease-standard)"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p aria-live="polite" className="type-label text-ink-muted">
        {remaining === 0
          ? "Congratulations! You qualify for free shipping."
          : `You're ${format({ amount: remaining.toFixed(2), currencyCode: "INR" })} away from free shipping.`}
      </p>
    </div>
  );
}
