"use client";

import { usePathname } from "next/navigation";

import { useCart } from "@/lib/cart/client";

export function CartMobileBarSpacer() {
  const isCartRoute = usePathname() === "/cart";
  const hasItems = useCart((state) => state.data.totalQuantity > 0);

  if (!isCartRoute || !hasItems) return null;

  return (
    <div
      aria-hidden="true"
      className="h-[calc(8.5rem+env(safe-area-inset-bottom))] desktop:hidden"
    />
  );
}
