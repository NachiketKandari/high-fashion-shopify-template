import type { Metadata } from "next";

import { Link } from "@/components/ui/link";
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
      <header className="grid gap-6">
        <nav
          aria-label="Breadcrumb"
          className="type-body-sm flex flex-wrap items-center gap-1 text-ink-muted"
        >
          <Link
            className="focus-ring inline-flex min-h-9 items-center hover:text-ink hover:underline"
            href="/account/profile"
          >
            Account &amp; Wallet
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Private Wishlist</span>
        </nav>
        <div className="grid gap-6">
          <h1 className="type-h2">My private wishlist</h1>
          <p className="type-body-sm text-ink-muted">
            Saved just for you. This wishlist is private to this browser.
          </p>
        </div>
      </header>
      <WishlistContent />
    </div>
  );
}
