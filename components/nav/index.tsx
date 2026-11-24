import { Suspense } from "react";

import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";

import { NavAccount, NavAccountFallback } from "./account";
import { CartIcon, CartIconFallback } from "./cart";
import { ContactDrawer } from "./contact-drawer";
import { MobileSearchLink } from "./mobile-search-link";
import { NAV_CHIP_CLASS } from "./nav-chip";
import { NavChrome } from "./nav-chrome";

export function Nav() {
  return (
    <NavChrome
      actions={
        <>
          {shopConfig.auth.isEnabled ? (
            <Link className={`${NAV_CHIP_CLASS} hidden desktop:flex`} href="/account/wishlist">
              Wishlist
            </Link>
          ) : null}
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
          {shopConfig.search.isEnabled && <MobileSearchLink />}
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
      searchEnabled={shopConfig.search.isEnabled}
    />
  );
}
