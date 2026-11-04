import Image from "next/image";

import { NewsletterForm } from "@/components/newsletter/form";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { FOOTER_COLUMNS } from "@/lib/nav";

const PAYMENTS = ["AMEX", "DINERS", "MASTERCARD", "RUPAY", "VISA"];

export function Footer() {
  return (
    <footer className="border-t border-rule bg-background">
      <Container className="pb-10 pt-16 md:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1.7fr] lg:gap-x-8">
          <div className="col-span-2 grid content-start gap-4 md:col-span-1">
            <div className="grid gap-2">
              <p className="text-2xs uppercase tracking-wider">Flagship Store</p>
              <p className="max-w-[260px] text-xs leading-[18px] text-muted-foreground">
                Shop No.1, Solace Apartment, 33rd Road, Bandra West, Mumbai, India
              </p>
              <p className="text-xs leading-[18px] text-muted-foreground">Open daily, 11am – 8pm</p>
            </div>
            <Image
              alt="Polite Society"
              className="mt-2 h-auto w-[315px] max-w-full"
              height={25}
              sizes="100vw"
              src="/reference/ps-wordmark.svg"
              width={315}
            />
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div className="grid content-start gap-3" key={column.title}>
              <p className="text-2xs uppercase tracking-wider">{column.title}</p>
              <ul className="grid gap-1.5" role="list">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="text-xs leading-[22px] text-muted-foreground transition-colors hover:text-foreground"
                      href={link.href}
                      {...(link.href.startsWith("http")
                        ? { rel: "noreferrer", target: "_blank" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 grid content-start gap-3 md:col-span-3 lg:col-span-1">
            <p className="text-xs text-foreground">Subscribe to Our Newsletter</p>
            <NewsletterForm className="text-2xs" inputId="footer-newsletter-email" />
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-transparent pt-2 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-2xs text-muted-foreground">
            © 2026 · Polite Society <span className="mx-1">·</span> Website by Embed Studios
          </p>
          <ul
            className="flex flex-wrap items-center gap-1.5"
            aria-label="Payment methods"
            role="list"
          >
            {PAYMENTS.map((payment) => (
              <li
                className="flex h-5 min-w-8 items-center justify-center border border-rule px-1 text-[8px] uppercase tracking-wider text-muted-foreground"
                key={payment}
              >
                {payment}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
