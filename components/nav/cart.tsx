import { HandbagIcon } from "lucide-react";

import { getCart } from "@/lib/cart/server";
import { withFallback } from "@/lib/shopify/errors/server";

import { CartIconClient } from "./cart-client";

export async function CartIcon() {
  const cart = await withFallback(getCart(), undefined);
  return <CartIconClient cartLabel="Cart" initialCart={cart ?? null} />;
}

export function CartIconFallback() {
  return (
    <span className="flex h-9 w-9 items-center justify-center text-ink">
      <HandbagIcon className="size-5" strokeWidth={1.25} />
      <span className="sr-only">Cart</span>
    </span>
  );
}
