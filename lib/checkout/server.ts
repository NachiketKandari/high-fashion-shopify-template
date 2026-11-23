import { unstable_rethrow } from "next/navigation";

import { isCustomerLoggedIn } from "@/lib/auth/server";
import type { CustomerAddress } from "@/lib/customer/types";
import type { Money } from "@/lib/money/types";
import {
  fetchCustomerAddresses,
  fetchCustomerStoreCredit,
} from "@/lib/shopify/operations/customer/server";

export interface CheckoutAddresses {
  addresses: CustomerAddress[];
  isSignedIn: boolean;
  storeCredit: Money[];
}

export interface CheckoutPaymentContext {
  isSignedIn: boolean;
  storeCredit: Money[];
}

export async function getCheckoutPaymentContext(): Promise<CheckoutPaymentContext> {
  if (!(await isCustomerLoggedIn())) {
    return { isSignedIn: false, storeCredit: [] };
  }

  try {
    const storeCredit = await fetchCustomerStoreCredit().catch((error) => {
      unstable_rethrow(error);
      return [];
    });
    return { isSignedIn: true, storeCredit };
  } catch (error) {
    unstable_rethrow(error);
    return { isSignedIn: true, storeCredit: [] };
  }
}

export async function getCheckoutAddresses(): Promise<CheckoutAddresses> {
  if (!(await isCustomerLoggedIn())) {
    return { addresses: [], isSignedIn: false, storeCredit: [] };
  }

  try {
    const [addresses, storeCredit] = await Promise.all([
      fetchCustomerAddresses(),
      fetchCustomerStoreCredit().catch((error) => {
        // The credit scope is optional; a missing balance must not block delivery.
        unstable_rethrow(error);
        return [];
      }),
    ]);
    return { addresses, isSignedIn: true, storeCredit };
  } catch (error) {
    // A missing address book still allows a guest delivery form; auth redirects must pass through.
    unstable_rethrow(error);
    return { addresses: [], isSignedIn: true, storeCredit: [] };
  }
}
