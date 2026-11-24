import type { ProductCard, SelectedOption } from "@/lib/product/types";

export interface WishlistItem {
  product: ProductCard;
  savedAt: string;
  selectedOptions: SelectedOption[];
}

export interface WishlistRefreshResult {
  products: ProductCard[];
  requestedIds: string[];
  success: boolean;
}
