"use client";

import type { CartData } from "@shopify/hydrogen";
import { Loader2, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart/client";

import { useCartDrawer } from "./context";
import { CartLineItems } from "./line-item";
import { CartSummary } from "./summary";
import { CartWarnings } from "./warnings";

const FREE_SHIPPING_THRESHOLD = 500;

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
        className="w-full max-w-[440px] gap-0 border-l border-rule p-0"
        closeButton={false}
        side="right"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-rule px-5">
          <SheetTitle className="text-xs uppercase tracking-wider">
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
      <div className="flex h-full flex-col px-5">
        <CartWarnings />
        <div className="flex flex-1 flex-col justify-start gap-4 pt-8">
          <h3 className="text-xs uppercase tracking-wider">Your shopping cart is empty</h3>
          <p className="max-w-[30ch] text-2xs leading-[18px] text-muted-foreground">
            Browse our latest collection or check your saved favorites to add more items to your
            cart.
          </p>
          <Button
            className="mt-2 h-9 w-fit rounded-none border border-foreground bg-transparent px-4 text-2xs uppercase tracking-wider text-foreground shadow-none hover:bg-foreground hover:text-background"
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
      <div className="grid flex-1 content-start gap-6 overflow-y-auto px-5 py-5">
        <CartWarnings />
        <CartLineItems lines={cart.lines.nodes} />
      </div>
      <footer className="grid gap-3 border-t border-rule px-5 pb-4 pt-4">
        <CartSummary cart={cart} />
        <Link
          className="justify-self-center text-2xs uppercase tracking-wider underline underline-offset-4"
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
  const subtotal = Number(cart.cost.subtotalAmount.amount);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="grid gap-2 border-b border-rule px-5 py-3">
      <div className="h-px w-full bg-rule">
        <div
          className="h-px bg-foreground transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-2xs text-muted-foreground">
        {remaining === 0
          ? "Congratulations! You qualify for free shipping."
          : `You're $${remaining.toFixed(0)} away from free shipping.`}
      </p>
    </div>
  );
}
