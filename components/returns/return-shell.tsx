import type { ReactNode } from "react";

import { Page } from "@/components/ui/page";

interface ReturnShellProps {
  children: ReactNode;
  summary: ReactNode;
}

export function ReturnShell({ children, summary }: ReturnShellProps) {
  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col desktop:flex-row desktop:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col gap-6 px-6 py-6 desktop:px-10 desktop:py-10">
          {children}
        </div>
        <aside className="flex flex-col gap-6 px-6 pb-10 desktop:w-[592px] desktop:shrink-0 desktop:border-l desktop:border-ink desktop:px-10 desktop:py-10">
          {summary}
        </aside>
      </div>
    </Page>
  );
}
