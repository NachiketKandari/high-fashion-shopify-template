"use client";

import { cn } from "cn";
import { usePathname } from "next/navigation";

import { Link } from "@/components/ui/link";

interface AccountTab {
  href: string;
  label: string;
}

export function MobileTabsClient({ tabs }: { tabs: AccountTab[] }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b desktop:hidden">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "type-body-sm flex min-h-9 flex-1 items-center justify-center px-3 text-center transition-colors",
            pathname.startsWith(tab.href)
              ? "border-b-2 border-ink font-normal text-ink"
              : "text-ink-muted hover:text-ink",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
