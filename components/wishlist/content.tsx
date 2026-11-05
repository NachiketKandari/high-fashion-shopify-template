"use client";

import { ProductCard } from "@/components/product-card/product-card";
import { Link } from "@/components/ui/link";
import { useWishlist } from "@/lib/wishlist/client";

export function WishlistContent() {
  const items = useWishlist();

  if (items.length === 0) {
    return (
      <div className="grid gap-4 py-6">
        <p className="type-h3">Your wishlist is empty</p>
        <p className="type-body-sm max-w-[40ch] text-ink-muted">
          Save pieces with the bookmark on any product card and find them here.
        </p>
        <Link
          className="type-control focus-ring mt-2 inline-flex h-9 w-fit items-center border border-ink px-4 transition-colors hover:bg-ink hover:text-inverse"
          href="/collections/all"
        >
          Explore collections
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-(--grid-gap) gap-y-(--grid-row-gap) tablet:grid-cols-3 desktop:grid-cols-4">
      {items.map(({ product }) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
