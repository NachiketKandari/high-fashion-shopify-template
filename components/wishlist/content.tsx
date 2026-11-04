"use client";

import { ProductCard } from "@/components/product-card/product-card";
import { Link } from "@/components/ui/link";
import { useWishlist } from "@/lib/wishlist/client";

export function WishlistContent() {
  const items = useWishlist();

  if (items.length === 0) {
    return (
      <div className="grid gap-4 py-6">
        <p className="text-xs uppercase tracking-wider">Your wishlist is empty</p>
        <p className="max-w-[40ch] text-2xs leading-[18px] text-muted-foreground">
          Save pieces with the bookmark on any product card and find them here.
        </p>
        <Link
          className="mt-2 inline-flex h-9 w-fit items-center border border-foreground px-4 text-2xs uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
          href="/collections/all"
        >
          Explore collections
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-[3px] gap-y-5 md:grid-cols-3 md:gap-y-6 lg:grid-cols-4">
      {items.map(({ product }) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
