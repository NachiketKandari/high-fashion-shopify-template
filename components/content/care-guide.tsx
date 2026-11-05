"use client";

import { cn } from "cn";
import { useState } from "react";

const GROUPS = [
  {
    items: [
      "Dry clean only",
      "Do not hand wash",
      "Do not wring or twist boning",
      "Do not tumble dry",
      "Do not bleach",
      "Dry flat in shade",
      "Steam only on reverse side (do not flat iron)",
    ],
    label: "Corsets",
  },
  {
    items: [
      "Dry clean or hand wash cold separately",
      "Do not soak",
      "Do not wring",
      "Do not tumble dry",
      "Do not bleach",
      "Dry flat in shade",
      "Iron on low heat on the reverse side",
    ],
    label: "Others",
  },
];

export function CareGuide() {
  const [active, setActive] = useState(GROUPS[0].label);

  return (
    <div className="grid gap-6">
      <div aria-label="Care categories" className="flex gap-6" role="tablist">
        {GROUPS.map((group) => (
          <button
            aria-selected={active === group.label}
            className={cn(
              "cursor-pointer text-2xs uppercase tracking-wider transition-opacity hover:opacity-60",
              active === group.label && "underline underline-offset-4",
            )}
            key={group.label}
            onClick={() => setActive(group.label)}
            role="tab"
            type="button"
          >
            {group.label}
          </button>
        ))}
      </div>
      {GROUPS.filter((group) => group.label === active).map((group) => (
        <ul
          className="grid max-w-xl gap-2 text-sm leading-[22px] font-light tracking-wide text-muted-foreground"
          key={group.label}
          role="list"
        >
          {group.items.map((item) => (
            <li className="flex gap-3" key={item}>
              <span aria-hidden="true">—</span>
              {item}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
