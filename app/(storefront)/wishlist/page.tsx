import { redirect } from "next/navigation";

import { shopConfig } from "@/lib/config";

export default function LegacyWishlistPage() {
  redirect(shopConfig.auth.isEnabled ? "/account/wishlist" : "/collections/all");
}
