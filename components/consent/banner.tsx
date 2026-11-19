"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { type ConsentChoice, readConsent, writeConsent } from "@/lib/consent";

export function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readConsent()) return;
    const frame = window.requestAnimationFrame(() => setOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function choose(choice: ConsentChoice) {
    writeConsent(choice);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <section
      aria-describedby="consent-description"
      aria-labelledby="consent-title"
      aria-live="polite"
      className="sticky bottom-0 z-(--z-header) border-t border-rule bg-paper px-6 pt-10 pb-10 desktop:px-10 desktop:pt-10 desktop:pb-20"
      data-slot="consent-banner"
    >
      <div className="flex flex-col gap-10 desktop:flex-row desktop:items-center desktop:gap-8">
        <div className="grid flex-1 gap-4">
          <h2 className="type-h3" id="consent-title">
            We value your privacy
          </h2>
          <p className="type-body-sm text-ink-muted" id="consent-description">
            We use essential cookies to make our site work. With your consent, we&apos;d also like
            to use analytics and marketing cookies to improve your shopping experience.
          </p>
        </div>
        <div className="flex flex-col gap-4 desktop:flex-row desktop:shrink-0">
          <Button
            className="w-full desktop:w-auto"
            onClick={() => choose("essential")}
            type="button"
            variant="outline"
          >
            Only Essentials
          </Button>
          <Button className="w-full desktop:w-auto" onClick={() => choose("all")} type="button">
            Allow All
          </Button>
        </div>
      </div>
    </section>
  );
}
