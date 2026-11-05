"use client";

import { cn } from "cn";
import { Bookmark } from "lucide-react";

import type { ProductCard } from "@/lib/product/types";
import { toggleWishlist, useWishlist } from "@/lib/wishlist/client";

interface WishlistButtonProps {
  product: ProductCard;
  variant?: "card" | "inline";
}

export function WishlistButton({ product, variant = "card" }: WishlistButtonProps) {
  const saved = useWishlist().some((item) => item.product.handle === product.handle);
  return (
    <button
      aria-label={
        saved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`
      }
      aria-pressed={saved}
      className={cn(
        "focus-ring z-10 flex size-9 cursor-pointer items-center justify-center text-ink",
        variant === "card"
          ? "absolute bottom-2 left-2 bg-paper/90 opacity-0 backdrop-blur-sm transition-opacity duration-(--motion-base) group-focus-within/card:opacity-100 group-hover/card:opacity-100 hover:bg-paper focus-visible:opacity-100 pointer-coarse:opacity-100"
          : "relative shrink-0",
      )}
      onClick={() => toggleWishlist(product)}
      type="button"
    >
      <Bookmark
        className={variant === "card" ? "size-3" : "size-5"}
        fill={saved ? "currentColor" : "none"}
        strokeWidth={1.25}
      />
    </button>
  );
}
