"use client";

import { useEffect, useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { NewsletterForm } from "./form";

const STORAGE_KEY = "ps-newsletter-dismissed-at";
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
      <DialogContent
        className="max-w-[448px] gap-0 rounded-none border border-rule p-0 shadow-xl"
        showCloseButton
      >
        <DialogTitle className="sr-only">Join Polite Society</DialogTitle>
        <div className="grid gap-6 p-8 pt-10">
          <div className="grid gap-3">
            <p className="text-sm uppercase tracking-wider">Join Polite Society</p>
            <p className="text-2xs leading-[18px] text-foreground">
              Get 5% off your first order, and first access to new chapters, campaigns, restocks and
              more.
            </p>
          </div>
          <NewsletterForm className="text-2xs" inputId="newsletter-popup-email" />
          <p className="text-2xs text-muted-foreground">You can unsubscribe at any time.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
