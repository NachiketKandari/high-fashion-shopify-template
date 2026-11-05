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
      className="focus-ring flex h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center transition-opacity hover:opacity-60"
      onClick={openOverlay}
      type="button"
    >
      <span className="type-nav hidden desktop:inline">{`Cart (${quantity})`}</span>
      <span className="relative flex desktop:hidden">
        <ShoppingBag className="size-4" strokeWidth={1.25} />
        {quantity > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 flex size-3.5 items-center justify-center rounded-full bg-ink text-label leading-none text-inverse">
            {quantity}
          </span>
        ) : null}
      </span>
    </button>
  );
}
