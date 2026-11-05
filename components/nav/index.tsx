import { PredictiveSearchProvider } from "@shopify/hydrogen/react";
import { Suspense } from "react";

import { CurrencySelector } from "@/components/currency/selector";
import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";

import { NavAccount, NavAccountFallback } from "./account";
import { CartIcon, CartIconFallback } from "./cart";
import { ContactDrawer } from "./contact-drawer";
import { Header } from "./header";
import { SearchModal } from "./search-modal";

export function Nav() {
  return (
    <Header
      actions={
        <>
          <CurrencySelector className="type-nav hidden h-9 desktop:inline-flex" />
          {shopConfig.search.isEnabled && (
            <PredictiveSearchProvider
              debounceInMs={300}
              limit={4}
              types={["PRODUCT", "COLLECTION", "QUERY"]}
            >
              <SearchModal />
            </PredictiveSearchProvider>
          )}
          <Link
            className="type-nav focus-ring hidden h-9 shrink-0 items-center px-1 transition-opacity hover:opacity-60 desktop:inline-flex"
            href="/pages/wishlist"
          >
            Wishlist
          </Link>
          <ContactDrawer />
          {shopConfig.auth.isEnabled && (
            <Suspense fallback={<NavAccountFallback />}>
              <NavAccount />
            </Suspense>
          )}
          <Suspense fallback={<CartIconFallback />}>
            <CartIcon />
          </Suspense>
        </>
      }
    />
  );
}
