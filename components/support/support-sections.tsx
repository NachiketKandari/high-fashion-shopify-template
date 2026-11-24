import type { ReactNode } from "react";

import { Link } from "@/components/ui/link";

export interface SupportLink {
  href: string;
  label: string;
}

interface SupportSectionItem {
  body: ReactNode;
  id?: string;
  title: string;
}

function SectionBody({ children }: { children: ReactNode }) {
  return <div className="type-body-sm text-ink-muted [&>p+p]:mt-3">{children}</div>;
}

export function SupportSteps({ items }: { items: SupportSectionItem[] }) {
  return (
    <ol className="grid list-none gap-6">
      {items.map((item, index) => (
        <li
          className="grid scroll-mt-24 gap-3 border-b border-rule pb-3"
          id={item.id}
          key={`${item.title}-${index}`}
        >
          <h2 className="type-h4 text-ink">
            <span className="text-ink-muted">{String(index + 1).padStart(2, "0")} / </span>
            {item.title}
          </h2>
          <SectionBody>{item.body}</SectionBody>
        </li>
      ))}
    </ol>
  );
}

export function SupportSections({ items }: { items: SupportSectionItem[] }) {
  return (
    <div className="grid gap-6">
      {items.map((item) => (
        <section
          className="grid scroll-mt-24 gap-3 border-b border-rule pb-3"
          id={item.id}
          key={item.id ?? item.title}
        >
          <h2 className="type-h4 text-ink">{item.title}</h2>
          <SectionBody>{item.body}</SectionBody>
        </section>
      ))}
    </div>
  );
}

export function SupportCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="grid gap-4 border border-rule p-6">
      <h2 className="type-h4 text-ink">{title}</h2>
      <div className="type-body-sm grid gap-4 text-ink-muted">{children}</div>
    </section>
  );
}

export function SupportRuleLinks({ links }: { links: SupportLink[] }) {
  return (
    <ul className="grid list-none" role="list">
      {links.map((link) => (
        <li className="border-b border-rule" key={link.href}>
          <Link
            className="type-body-sm focus-ring flex min-h-11 items-center py-6 text-ink hover:underline hover:decoration-ink hover:underline-offset-4"
            href={link.href}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SupportInlineLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      className="type-body-sm focus-ring text-ink underline decoration-ink underline-offset-4"
      href={href}
    >
      {children}
    </Link>
  );
}

export function SupportActionLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      className="type-body-sm focus-ring inline-flex min-h-9 items-center text-ink underline decoration-ink underline-offset-4"
      href={href}
    >
      {children}
    </Link>
  );
}
