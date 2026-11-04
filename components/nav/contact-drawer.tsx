"use client";

import { ChevronRight, Mail, MapPin, MessageCircle, Phone, X } from "lucide-react";

import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const ROWS = [
  {
    href: "https://wa.me/918976064836",
    icon: MessageCircle,
    label: "WhatsApp",
  },
  {
    href: "tel:+918976064836",
    icon: Phone,
    label: "Call Us",
  },
  {
    href: "mailto:hi@politesociety.in",
    icon: Mail,
    label: "Email Us",
  },
  {
    href: "https://maps.google.com",
    icon: MapPin,
    label: "Visit Our Flagship Store",
  },
];

export function ContactDrawer() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            aria-label="Contact us"
            className="flex cursor-pointer items-center justify-center transition-opacity hover:opacity-60 xl:hidden"
            type="button"
          >
            <MessageCircle className="size-4" strokeWidth={1.25} />
          </button>
        }
      />
      <SheetTrigger
        render={
          <button
            className="hidden cursor-pointer text-xs uppercase tracking-wider transition-opacity hover:opacity-60 xl:inline-flex"
            type="button"
          >
            Help
          </button>
        }
      />
      <SheetContent
        className="w-full max-w-[440px] gap-0 border-l border-rule p-0"
        closeButton={false}
        side="right"
      >
        <SheetTitle className="sr-only">Contact us</SheetTitle>
        <div className="flex h-14 shrink-0 items-center justify-between px-5">
          <span className="text-xs uppercase tracking-wider">Contact Us</span>
          <SheetClose
            aria-label="Close contact"
            className="flex size-9 items-center justify-center"
            type="button"
          >
            <X className="size-4" strokeWidth={1.25} />
          </SheetClose>
        </div>
        <ul className="grid px-5" role="list">
          {ROWS.map((row) => {
            const Icon = row.icon;
            return (
              <li key={row.label}>
                <a
                  className="flex items-center gap-3 border-b border-rule py-4 text-xs uppercase tracking-wider transition-opacity hover:opacity-60"
                  href={row.href}
                  rel="noreferrer"
                  target={row.href.startsWith("http") ? "_blank" : undefined}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.25} />
                  <span className="flex-1">{row.label}</span>
                  <ChevronRight className="size-4" strokeWidth={1.25} />
                </a>
              </li>
            );
          })}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
