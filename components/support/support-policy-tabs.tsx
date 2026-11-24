"use client";

import { cn } from "cn";
import { useEffect, useState } from "react";

interface SupportPolicyTab {
  id: string;
  label: string;
}

export function SupportPolicyTabs({ tabs }: { tabs: SupportPolicyTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  useEffect(() => {
    const sync = () => {
      let current = tabs[0]?.id ?? "";
      for (const tab of tabs) {
        const element = document.getElementById(tab.id);
        if (element && element.getBoundingClientRect().top <= 160) current = tab.id;
      }
      setActive(current);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [tabs]);

  return (
    <nav
      aria-label="Policy sections"
      className="grid gap-4 border-b border-rule pb-6 desktop:grid-cols-2"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <a
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "type-h4 focus-ring flex min-h-9 items-center text-ink-muted transition-colors hover:text-ink",
              isActive && "text-ink underline decoration-ink underline-offset-4",
            )}
            href={`#${tab.id}`}
            key={tab.id}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </a>
        );
      })}
    </nav>
  );
}
