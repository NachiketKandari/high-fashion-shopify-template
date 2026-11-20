import type { ReactNode } from "react";

import { BrandBar } from "@/components/shell/brand-bar";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BrandBar
        className="border-ink-strong desktop:h-(--header-bar-h) desktop:border-b-0"
        variant="bar-logo"
      />
      <main className="flex min-w-0 flex-1 flex-col" id="main-content">
        {children}
      </main>
    </>
  );
}
