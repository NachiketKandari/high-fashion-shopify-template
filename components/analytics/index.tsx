import type { ShopifyScriptsI18n, ShopifyScriptsShop } from "@shopify/hydrogen";

import { isShopifyScriptsEnabled, shopConfig } from "@/lib/config";

import { ConsentAwareAnalytics } from "./consent-gate";
import { ShopifyScriptsTracker } from "./shopify-client";

export function AnalyticsComponents() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const i18n: ShopifyScriptsI18n = {
    country: shopConfig.localization.country,
    language: shopConfig.localization.language,
  };
  const shop: ShopifyScriptsShop = {
    myshopifyDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN as string,
    shopId: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID as string,
    storefrontId: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID ?? "",
  };

  return (
    <>
      <ConsentAwareAnalytics gaMeasurementId={gaMeasurementId} gtmId={gtmId} />
      {isShopifyScriptsEnabled && <ShopifyScriptsTracker i18n={i18n} shop={shop} />}
    </>
  );
}
