import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

import type { SupportLink } from "./support-sections";

interface SupportAsideProps {
  children: ReactNode;
  title: string;
}

export function SupportAside({ children, title }: SupportAsideProps) {
  return (
    <section className="grid gap-6">
      <h2 className="type-h3 text-ink">{title}</h2>
      <div className="grid gap-6">{children}</div>
    </section>
  );
}

export function SupportAnchorLinks({ links }: { links: SupportLink[] }) {
  return (
    <ul className="grid list-none" role="list">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            className="type-body-sm focus-ring flex min-h-9 items-center text-ink hover:underline hover:decoration-ink hover:underline-offset-4"
            href={`#${link.href}`}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SupportRelated({ links }: { links: SupportLink[] }) {
  return (
    <section className="grid gap-6 border-t border-rule pt-6">
      <h2 className="type-h4 text-ink">Related pages</h2>
      <ul className="grid list-none" role="list">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              className="type-body-sm focus-ring flex min-h-9 items-center text-ink hover:underline hover:decoration-ink hover:underline-offset-4"
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <Button className="w-full" render={<Link href="/support" />} size="lg" variant="outline">
        Contact Concierge
      </Button>
    </section>
  );
}
