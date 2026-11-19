import { BotIdClient } from "botid/client";
import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Suspense } from "react";

import "./globals.css";

import { AnalyticsComponents } from "@/components/analytics";
import { CartProviderWrapper } from "@/components/cart/context";
import { CartStandardActionsScript } from "@/components/cart/standard-actions";
import { CurrencyProvider } from "@/components/currency/provider";
import { SiteSchema } from "@/components/schema/site-schema";
import { botIdProtectedRoutes } from "@/lib/botid";
import { seedCartData } from "@/lib/cart/server";
import { shopConfig } from "@/lib/config";

export const ensureStatic = "prefetch";

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Un-awaited: the promise streams to the client provider; never block the shell on it.
  const cartData = seedCartData();
  return (
    <html lang={shopConfig.localization.locale}>
      <head>
        {shopConfig.botid.isEnabled && <BotIdClient protect={botIdProtectedRoutes} />}
        <CartStandardActionsScript />
      </head>
      <body className={`${dmSans.variable} flex min-h-dvh flex-col font-sans antialiased`}>
        <a
          href="#main-content"
          className="type-control sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-(--z-skip) focus:flex focus:h-9 focus:items-center focus:border focus:border-ink focus:bg-paper focus:px-5 focus:text-ink"
        >
          Skip to content
        </a>
        <SiteSchema />

        <CurrencyProvider>
          <CartProviderWrapper cartData={cartData}>
            {children}
            <Suspense>
              <AnalyticsComponents />
            </Suspense>
          </CartProviderWrapper>
        </CurrencyProvider>
      </body>
    </html>
  );
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    description: `Shop premium products, curated collections, and latest offers from ${shopConfig.site.name}.`,
    generator: "Next.js",
    metadataBase: new URL(shopConfig.site.url),
    openGraph: {
      images: [{ url: "/og-default.png", width: 1200, height: 628 }],
    },
    title: {
      default: shopConfig.site.name,
      template: `%s | ${shopConfig.site.name}`,
    },
  };
};
