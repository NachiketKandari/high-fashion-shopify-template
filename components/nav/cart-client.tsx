"use client";

import { ShoppingBag } from "lucide-react";

import { Link } from "@/components/ui/link";
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

  return (
    <>
      <Link
        aria-label={`${cartLabel} (${quantity})`}
        className="focus-ring flex size-9 items-center justify-center desktop:hidden"
        href="/cart"
      >
        <ShoppingBag className="size-6" strokeWidth={1.5} />
      </Link>
      <Link
        aria-label={`${cartLabel} (${quantity})`}
        className={`${NAV_CHIP_CLASS} hidden desktop:flex`}
        href="/cart"
      >
        {quantity > 0 ? `${cartLabel} (${quantity})` : cartLabel}
      </Link>
    </>
  );
}
