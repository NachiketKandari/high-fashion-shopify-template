import { ShoppingBag } from "lucide-react";

import { getCart } from "@/lib/cart/server";
import { withFallback } from "@/lib/shopify/errors/server";

import { CartIconClient } from "./cart-client";

export async function CartIcon() {
  const cart = await withFallback(getCart(), undefined);
  return <CartIconClient cartLabel="Bag" initialCart={cart ?? null} />;
}

export function CartIconFallback() {
  return (
    <span className="flex h-9 w-9 items-center justify-center text-ink">
      <ShoppingBag className="size-6" strokeWidth={1.5} />
      <span className="sr-only">Bag</span>
    </span>
  );
}
