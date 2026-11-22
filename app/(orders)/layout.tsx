import type { ReactNode } from "react";

import { BrandBar } from "@/components/shell/brand-bar";

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BrandBar className="border-ink-strong" />
      <main className="flex min-w-0 flex-1 flex-col" id="main-content">
        {children}
      </main>
    </>
  );
}
