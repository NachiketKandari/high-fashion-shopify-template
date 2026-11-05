import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";

interface ContentPageProps {
  children: ReactNode;
  eyebrow?: string;
  title: string;
}

export function ContentPage({ children, eyebrow, title }: ContentPageProps) {
  return (
    <Page>
      <Container className="max-w-3xl">
        <div className="grid gap-10">
          <header className="grid gap-3 border-b border-rule pb-6">
            {eyebrow ? <p className="type-label text-ink-muted">{eyebrow}</p> : null}
            <h1 className="type-display">{title}</h1>
          </header>
          {children}
        </div>
      </Container>
    </Page>
  );
}

interface SectionProps {
  children: ReactNode;
  heading?: string;
  id?: string;
}

export function ContentSection({ children, heading, id }: SectionProps) {
  return (
    <section className="grid scroll-mt-24 gap-4" id={id}>
      {heading ? <h2 className="type-h4 text-ink">{heading}</h2> : null}
      <div className="type-body grid gap-4 text-ink-muted">{children}</div>
    </section>
  );
}
