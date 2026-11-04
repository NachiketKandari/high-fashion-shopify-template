"use client";

import { Bookmark } from "lucide-react";

import type { ProductCard } from "@/lib/product/types";
import { toggleWishlist, useWishlist } from "@/lib/wishlist/client";

export function WishlistButton({ product }: { product: ProductCard }) {
  const saved = useWishlist().some((item) => item.product.handle === product.handle);
  return (
    <button
      aria-label={
        saved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`
      }
      aria-pressed={saved}
      className="relative z-10 flex size-6 cursor-pointer items-start justify-center text-foreground"
      onClick={() => toggleWishlist(product)}
      type="button"
    >
      <Bookmark className="size-3" fill={saved ? "currentColor" : "none"} strokeWidth={1.25} />
    </button>
  );
}
