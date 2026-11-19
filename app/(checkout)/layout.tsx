import type { ReactNode } from "react";

import { BrandBar } from "@/components/shell/brand-bar";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BrandBar />
      <main className="flex min-w-0 flex-1 flex-col" id="main-content">
        {children}
      </main>
    </>
  );
}
