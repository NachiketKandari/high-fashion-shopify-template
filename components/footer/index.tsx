import { cn } from "cn";

import { Wordmark } from "@/components/brand/wordmark";
import { NewsletterForm } from "@/components/newsletter/form";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";
import { FOOTER_COLUMNS } from "@/lib/nav";

const PAYMENTS = ["AMEX", "DINERS", "MAESTRO", "MASTERCARD", "RUPAY", "VISA"];

export function Footer() {
  return (
    <footer
      className={cn(
        "border-t border-rule bg-paper pt-20",
        shopConfig.agent.isEnabled ? "pb-22" : "pb-10",
      )}
    >
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 tablet:grid-cols-3 desktop:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1.7fr] desktop:gap-x-8">
          <div className="col-span-2 grid content-start gap-4 tablet:col-span-1">
            <div className="grid gap-2">
              <p className="type-label">Flagship Store</p>
              <p className="type-body-sm max-w-[260px] text-ink-muted">
                {shopConfig.site.contact.address}
              </p>
              <p className="type-body-sm text-ink-muted">Open daily, 11am – 8pm</p>
            </div>
            <Wordmark className="mt-2" variant="footer" />
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div className="grid content-start gap-2" key={column.title}>
              <p className="type-label">{column.title}</p>
              <ul className="grid" role="list">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="type-body-sm focus-ring flex min-h-9 items-center text-ink-muted transition-colors hover:text-ink"
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

          <div className="col-span-2 grid content-start gap-3 tablet:col-span-3 desktop:col-span-1">
            <p className="type-label">Subscribe to Our Newsletter</p>
            <NewsletterForm inputId="footer-newsletter-email" />
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-rule pt-4 tablet:flex-row tablet:items-end tablet:justify-between">
          <p className="type-label text-ink-muted">
            © 2026 · {shopConfig.site.name} <span className="mx-1">·</span> Website by UniPlus
          </p>
          <ul
            aria-label="Payment methods"
            className="flex flex-wrap items-center gap-1.5"
            role="list"
          >
            {PAYMENTS.map((payment) => (
              <li
                className="type-label flex h-5 min-w-8 items-center justify-center border border-rule px-1 text-ink-muted"
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
