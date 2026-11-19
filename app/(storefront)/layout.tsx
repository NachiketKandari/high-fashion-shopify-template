import { Suspense, type ReactNode } from "react";

import { ActionBar } from "@/components/action-bar";
import { AgentButton } from "@/components/agent/agent-button";
import { CartUI } from "@/components/cart/cart-ui";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { NavFallback } from "@/components/nav/fallback";
import { NewsletterPopup } from "@/components/newsletter/popup";
import { shopConfig } from "@/lib/config";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<NavFallback />}>
        <Nav />
      </Suspense>
      <main className="flex min-w-0 flex-1 flex-col" id="main-content">
        {children}
      </main>
      <Footer />
      <CartUI />
      <Suspense fallback={null}>
        <NewsletterPopup />
      </Suspense>
      <Suspense>
        <ActionBar>{shopConfig.agent.isEnabled && <AgentButton />}</ActionBar>
      </Suspense>
    </>
  );
}
