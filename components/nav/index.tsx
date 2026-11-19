import { SearchIcon } from "lucide-react";
import { Suspense } from "react";

import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";

import { NavAccount, NavAccountFallback } from "./account";
import { CartIcon, CartIconFallback } from "./cart";
import { ContactDrawer } from "./contact-drawer";
import { Header } from "./header";
import { NAV_CHIP_CLASS } from "./nav-chip";
import { SearchModal } from "./search-modal";

export function Nav() {
  return (
    <Header
      actions={
        <>
          <Link className={`${NAV_CHIP_CLASS} hidden desktop:flex`} href="/pages/wishlist">
            Wishlist
          </Link>
          <Suspense fallback={<CartIconFallback />}>
            <CartIcon />
          </Suspense>
          <ContactDrawer />
          {shopConfig.auth.isEnabled && (
            <Suspense fallback={<NavAccountFallback />}>
              <NavAccount />
            </Suspense>
          )}
        </>
      }
      mobileActions={
        <>
          {shopConfig.search.isEnabled && (
            <Link
              aria-label="Search"
              className="focus-ring flex size-9 items-center justify-center text-ink"
              href="/search"
            >
              <SearchIcon className="size-6" strokeWidth={1.5} />
            </Link>
          )}
          <Suspense fallback={<CartIconFallback />}>
            <CartIcon />
          </Suspense>
          {shopConfig.auth.isEnabled && (
            <Suspense fallback={<NavAccountFallback />}>
              <NavAccount />
            </Suspense>
          )}
        </>
      }
      search={shopConfig.search.isEnabled ? <SearchModal /> : null}
    />
  );
}
