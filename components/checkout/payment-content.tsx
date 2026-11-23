import { redirect } from "next/navigation";

import { getCart } from "@/lib/cart/server";
import { getCheckoutPaymentContext } from "@/lib/checkout/server";

import { PaymentView } from "./payment-view";

export async function PaymentContent() {
  const cart = await getCart();
  if (!cart || cart.totalQuantity === 0) redirect("/cart");

  const { storeCredit } = await getCheckoutPaymentContext();
  return <PaymentView storeCredit={storeCredit} />;
}
