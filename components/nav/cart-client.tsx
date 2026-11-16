"use client";

import { useCartDrawer } from "@/components/cart/context";
import { useCart } from "@/lib/cart/client";

import { NAV_CHIP_CLASS } from "./nav-chip";

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
      className={NAV_CHIP_CLASS}
      onClick={openOverlay}
      type="button"
    >
      {quantity > 0 ? `${cartLabel} (${quantity})` : cartLabel}
    </button>
  );
}
