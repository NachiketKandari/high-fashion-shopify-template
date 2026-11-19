import { redirect } from "next/navigation";

import { getCart } from "@/lib/cart/server";
import { getCheckoutAddresses } from "@/lib/checkout/server";

import { CheckoutView } from "./checkout-view";

export async function CheckoutContent() {
  const cart = await getCart();
  if (!cart || cart.totalQuantity === 0) redirect("/cart");

  const { addresses, isSignedIn, storeCredit } = await getCheckoutAddresses();
  return <CheckoutView addresses={addresses} isSignedIn={isSignedIn} storeCredit={storeCredit} />;
}
