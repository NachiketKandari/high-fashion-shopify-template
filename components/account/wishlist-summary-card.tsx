"use client";

import { useWishlistItems } from "@/lib/wishlist/client";

import { SummaryCard } from "./summary-card";

export function WishlistSummaryCard() {
  const items = useWishlistItems();
  const count = items?.length ?? 0;

  return (
    <SummaryCard
      action="View Wishlist"
      href="/account/wishlist"
      label="Private wishlist"
      value={`${count} saved ${count === 1 ? "piece" : "pieces"}`}
    />
  );
}
