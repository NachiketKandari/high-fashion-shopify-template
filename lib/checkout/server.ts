import { unstable_rethrow } from "next/navigation";

import { isCustomerLoggedIn } from "@/lib/auth/server";
import type { CustomerAddress } from "@/lib/customer/types";
import { fetchCustomerAddresses } from "@/lib/shopify/operations/customer/server";

export interface CheckoutAddresses {
  addresses: CustomerAddress[];
  isSignedIn: boolean;
}

export async function getCheckoutAddresses(): Promise<CheckoutAddresses> {
  if (!(await isCustomerLoggedIn())) return { addresses: [], isSignedIn: false };

  try {
    return { addresses: await fetchCustomerAddresses(), isSignedIn: true };
  } catch (error) {
    // A missing address book still allows a guest delivery form; auth redirects must pass through.
    unstable_rethrow(error);
    return { addresses: [], isSignedIn: true };
  }
}
