"use client";

import { ChevronRight, Mail, MapPin, MessageCircle, Phone, X } from "lucide-react";

import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { shopConfig } from "@/lib/config";

const { contact } = shopConfig.site;

const ROWS = [
  {
    href: contact.whatsappHref,
    icon: MessageCircle,
    label: "WhatsApp",
  },
  {
    href: contact.phoneHref,
    icon: Phone,
    label: "Call Us",
  },
  {
    href: `mailto:${contact.email}`,
    icon: Mail,
    label: "Email Us",
  },
  {
    href: contact.mapUrl,
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
            className="focus-ring flex size-9 shrink-0 cursor-pointer items-center justify-center transition-opacity hover:opacity-60 desktop:hidden"
            type="button"
          >
            <MessageCircle className="size-4" strokeWidth={1.25} />
          </button>
        }
      />
      <SheetTrigger
        render={
          <button
            className="type-nav focus-ring hidden h-9 cursor-pointer items-center px-1 transition-opacity hover:opacity-60 desktop:inline-flex"
            type="button"
          >
            Help
          </button>
        }
      />
      <SheetContent
        className="w-(--drawer-search) max-w-full gap-0 border-l border-rule p-0"
        closeButton={false}
        side="right"
      >
        <SheetTitle className="sr-only">Contact us</SheetTitle>
        <div className="flex h-14 shrink-0 items-center justify-between px-(--gutter)">
          <span className="type-h3">Contact Us</span>
          <SheetClose
            aria-label="Close contact"
            className="focus-ring flex size-9 items-center justify-center"
            type="button"
          >
            <X className="size-4" strokeWidth={1.25} />
          </SheetClose>
        </div>
        <ul className="grid px-(--gutter)" role="list">
          {ROWS.map((row) => {
            const Icon = row.icon;
            return (
              <li key={row.label}>
                <a
                  className="type-label focus-ring flex min-h-9 items-center gap-3 border-b border-rule py-4 transition-opacity hover:opacity-60"
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
