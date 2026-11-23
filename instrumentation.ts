import type { Instrumentation } from "next";

import { reportRequestError } from "@/lib/observability/server";
import { configureShopifyLogging } from "@/lib/shopify/logging/server";

export function register() {
  configureShopifyLogging();
}

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  reportRequestError(error, request, context);
};
