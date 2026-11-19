import { Wordmark } from "@/components/brand/wordmark";
import { NewsletterForm } from "@/components/newsletter/form";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { FOOTER_COLUMNS } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="border-t border-disabled bg-paper pt-20 pb-10 desktop:pt-[120px] desktop:pb-[120px]">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 tablet:grid-cols-3 desktop:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1.7fr] desktop:gap-x-8">
          <div className="col-span-2 grid content-start tablet:col-span-1">
            <Wordmark variant="footer" />
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
            <p className="type-label">Subscribe to Our Newsletters</p>
            <NewsletterForm inputId="footer-newsletter-email" />
          </div>
        </div>
      </Container>
    </footer>
  );
}
