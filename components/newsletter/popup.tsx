"use client";

import { useEffect, useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { shopConfig } from "@/lib/config";

import { NewsletterForm } from "./form";

const STORAGE_KEY = "newsletter-dismissed-at";
const DELAY_MS = 5000;
const DISMISS_DAYS = 30;

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissedAt = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
    if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    const timer = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="gap-0 border-rule p-0" showCloseButton>
        <DialogTitle className="sr-only">Join {shopConfig.site.name}</DialogTitle>
        <div className="grid gap-6 p-8 pt-10">
          <div className="grid gap-3">
            <p className="type-h3">Join {shopConfig.site.name}</p>
            <p className="type-body-sm text-ink">
              Get 5% off your first order, and first access to new chapters, campaigns, restocks and
              more.
            </p>
          </div>
          <NewsletterForm inputId="newsletter-popup-email" />
          <p className="type-body-sm text-ink-muted">You can unsubscribe at any time.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
