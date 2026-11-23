"use client";

import { useWishlist } from "@/lib/wishlist/client";

import { SummaryCard } from "./summary-card";

export function WishlistSummaryCard() {
  const items = useWishlist();
  const count = items.length;

  return (
    <SummaryCard
      action="View Wishlist"
      href="/pages/wishlist"
      label="Private wishlist"
      value={`${count} saved ${count === 1 ? "piece" : "pieces"}`}
    />
  );
}
