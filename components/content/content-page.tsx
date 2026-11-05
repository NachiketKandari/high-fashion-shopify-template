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
    <Page className="pt-8 pb-24 md:pt-12">
      <Container className="max-w-3xl">
        <div className="grid gap-10">
          <header className="grid gap-3 border-b border-rule pb-6">
            {eyebrow ? (
              <p className="text-2xs uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
            ) : null}
            <h1 className="text-lg uppercase leading-[23px] tracking-wider">{title}</h1>
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
      {heading ? (
        <h2 className="text-2xs uppercase tracking-wider text-foreground">{heading}</h2>
      ) : null}
      <div className="grid gap-4 text-sm leading-[21px] font-light tracking-wide text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
