import type { Metadata } from "next";

import { AccountPageHeader } from "@/components/account/page-header";
import { WishlistContent } from "@/components/wishlist/content";

export const metadata: Metadata = {
  title: "Private wishlist",
  robots: {
    follow: false,
    index: false,
  },
};

export default function AccountWishlistPage() {
  return (
    <div className="grid gap-6">
      <AccountPageHeader
        breadcrumb="Private wishlist"
        description="Saved just for you. This wishlist is private to this browser."
        title="My private wishlist"
      />
      <WishlistContent />
    </div>
  );
}
