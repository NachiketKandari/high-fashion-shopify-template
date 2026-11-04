"use client";

import { ShoppingBag } from "lucide-react";

import { useCartDrawer } from "@/components/cart/context";
import { useCart } from "@/lib/cart/client";

interface CartIconClientProps {
  cartLabel: string;
  initialCart: { totalQuantity: number } | null;
}

export function CartIconClient({ cartLabel, initialCart }: CartIconClientProps) {
  const quantity = useCart((state) =>
    state.loading
      ? (initialCart?.totalQuantity ?? state.data.totalQuantity)
      : state.data.totalQuantity,
  );
  const { openOverlay } = useCartDrawer();

  return (
    <button
      aria-label={`${cartLabel} (${quantity})`}
      className="flex cursor-pointer items-center justify-center text-xs uppercase tracking-wider transition-opacity hover:opacity-60"
      onClick={openOverlay}
      type="button"
    >
      <span className="hidden xl:inline">{`Cart (${quantity})`}</span>
      <span className="relative flex xl:hidden">
        <ShoppingBag className="size-4" strokeWidth={1.25} />
        {quantity > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center rounded-full bg-foreground text-[9px] leading-none text-background">
            {quantity}
          </span>
        ) : null}
      </span>
    </button>
  );
}
