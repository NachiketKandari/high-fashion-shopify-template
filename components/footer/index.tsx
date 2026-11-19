import { Wordmark } from "@/components/brand/wordmark";
import { NewsletterForm } from "@/components/newsletter/form";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { FOOTER_COLUMNS } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="border-t border-disabled bg-paper pt-20 pb-10 desktop:pt-30 desktop:pb-30">
      <Container>
        <div className="flex flex-col gap-12 tablet:gap-16 desktop:flex-row desktop:items-start desktop:justify-between desktop:gap-0">
          <Wordmark variant="footer" />

          <div className="grid grid-cols-2 gap-x-10 gap-y-10 tablet:grid-cols-4 desktop:flex desktop:gap-20">
            {FOOTER_COLUMNS.map((column) => (
              <div className="grid w-20 content-start gap-4" key={column.title}>
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
          </div>

          <div className="grid content-start gap-3 desktop:w-60">
            <p className="type-label">Subscribe to Our Newsletters</p>
            <NewsletterForm inputId="footer-newsletter-email" />
          </div>
        </div>
      </Container>
    </footer>
  );
}
