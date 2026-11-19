import { Suspense } from "react";

import { CartMobileBarSpacer } from "./mobile-bar-spacer";
import { CartNotifications } from "./notifications";
import { CartOverlay } from "./overlay";

export function CartUI() {
  return (
    <>
      <CartNotifications />
      <CartOverlay description="Review your cart items and proceed to checkout" title="Cart" />
      <Suspense fallback={null}>
        <CartMobileBarSpacer />
      </Suspense>
    </>
  );
}
