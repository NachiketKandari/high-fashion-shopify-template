import { PredictiveSearchProvider } from "@shopify/hydrogen/react";
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
      search={
        shopConfig.search.isEnabled ? (
          <PredictiveSearchProvider
            debounceInMs={300}
            limit={4}
            types={["PRODUCT", "COLLECTION", "QUERY"]}
          >
            <SearchModal />
          </PredictiveSearchProvider>
        ) : null
      }
    />
  );
}
