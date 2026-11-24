"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { shopConfig } from "@/lib/config";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";

import { NewsletterForm } from "./form";

const STORAGE_KEY = "newsletter-dismissed-at";
const SHOWN_KEY = "newsletter-shown";
const DELAY_MS = 2_000;
const DISMISS_DAYS = 30;

export function NewsletterPopup() {
  const pathname = usePathname();
  return pathname === "/" ? <NewsletterDialog /> : null;
}

function NewsletterDialog() {
  const headingRef = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem(SHOWN_KEY)) return;

    const dismissedAt = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
    if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;

    let timer: number | undefined;
    function schedule() {
      window.clearTimeout(timer);
      if (readConsent() !== "all") return;
      timer = window.setTimeout(() => {
        window.sessionStorage.setItem(SHOWN_KEY, "1");
        setOpen(true);
      }, DELAY_MS);
    }

    schedule();
    window.addEventListener(CONSENT_EVENT, schedule);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CONSENT_EVENT, schedule);
    };
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="gap-0 border-rule p-0" initialFocus={headingRef} showCloseButton>
        <DialogTitle className="sr-only">Join {shopConfig.site.name}</DialogTitle>
        <div className="grid gap-6 p-8 pt-10">
          <div className="grid gap-3">
            <p className="type-h3 outline-none" ref={headingRef} tabIndex={-1}>
              Join {shopConfig.site.name}
            </p>
            <p className="type-body-sm text-ink">
              Get 5% off your first order, and first access to new chapters, campaigns, restocks and
              more.
            </p>
          </div>
          <NewsletterForm inputId="newsletter-popup-email" variant="swipe" />
          <p className="type-body-sm text-ink-muted">You can unsubscribe at any time.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
