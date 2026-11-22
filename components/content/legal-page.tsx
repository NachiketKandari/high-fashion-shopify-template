import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Prose } from "@/components/ui/prose";

import { RichTextPage } from "./rich-text-page";

export const LEGAL_DOCUMENTS = {
  "privacy-policies": {
    related: [
      { href: "/pages/terms-of-service", label: "Terms & Conditions" },
      { href: "/pages/shipping-returns", label: "Shipping" },
      { href: "/pages/returns-exchanges", label: "Returns & Exchange" },
    ],
    title: "Privacy Policy",
  },
  "terms-of-service": {
    related: [
      { href: "/pages/privacy-policies", label: "Privacy Policy" },
      { href: "/pages/shipping-returns", label: "Shipping" },
      { href: "/pages/returns-exchanges", label: "Returns & Exchange" },
    ],
    title: "Terms of Service",
  },
} as const;

export type LegalDocumentHandle = keyof typeof LEGAL_DOCUMENTS;

interface PolicySection {
  html: string;
  id: string;
  label: string;
}

interface ParsedPolicy {
  intro: string;
  sections: PolicySection[];
}

interface LegalPageProps {
  body: string;
  document: (typeof LEGAL_DOCUMENTS)[LegalDocumentHandle];
}

interface PolicyNavProps {
  className?: string;
  sections: PolicySection[];
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match);
}

function headingLabel(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

function headingId(label: string, seen: Set<string>): string {
  const slug =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
  let suffix = "";
  let counter = 2;
  while (seen.has(`section-${slug}${suffix}`)) {
    suffix = `-${counter}`;
    counter += 1;
  }
  const id = `section-${slug}${suffix}`;
  seen.add(id);
  return id;
}

// The Shopify rich text editor writes flat block-level HTML, so the sanitized body splits
// cleanly at top-level h2 boundaries; bodies without an h2 keep the generic rich-text layout.
function parsePolicySections(body: string): ParsedPolicy | null {
  const headings = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  if (headings.length === 0) return null;

  const seen = new Set<string>();
  const sections = headings.map((heading, index) => {
    const label = headingLabel(heading[1]);
    const start = heading.index ?? 0;
    const end = headings[index + 1]?.index ?? body.length;
    return {
      html: body.slice(start, end).trim(),
      id: headingId(label, seen),
      label,
    };
  });

  return { intro: body.slice(0, headings[0].index ?? 0).trim(), sections };
}

function PolicyNavList({ sections }: Pick<PolicyNavProps, "sections">) {
  return (
    <ul className="grid" role="list">
      {sections.map((section) => (
        <li key={section.id}>
          <Link
            className="type-body-sm focus-ring flex min-h-9 items-center text-ink-muted transition-colors hover:text-ink"
            href={`#${section.id}`}
          >
            {section.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MobilePolicyNav({ sections }: PolicyNavProps) {
  return (
    <details className="group border-b border-rule desktop:hidden">
      <summary className="type-control flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-ink [&::-webkit-details-marker]:hidden">
        On this page
        <ChevronDownIcon
          aria-hidden="true"
          className="size-3 shrink-0 transition-transform duration-(--motion-base) ease-(--ease-standard) group-open:rotate-180 motion-reduce:transform-none"
          strokeWidth={1.25}
        />
      </summary>
      <div className="pb-4">
        <PolicyNavList sections={sections} />
      </div>
    </details>
  );
}

function PolicyRail({
  document,
  sections,
}: PolicyNavProps & { document: LegalPageProps["document"] }) {
  return (
    <aside className="hidden desktop:sticky desktop:top-(--header-bar-h) desktop:block desktop:self-start">
      <div className="grid gap-10">
        <nav aria-label="On this page" className="grid gap-4">
          <p className="type-h3">On this page</p>
          <PolicyNavList sections={sections} />
        </nav>
        <div className="grid gap-4 border-t border-rule pt-8">
          <p className="type-h3">Related pages</p>
          <ul className="grid" role="list">
            {document.related.map((page) => (
              <li key={page.href}>
                <Link
                  className="type-body-sm focus-ring flex min-h-9 items-center text-ink-muted transition-colors hover:text-ink"
                  href={page.href}
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button
            className="mt-2 w-full"
            render={<Link href="/pages/contact-us" />}
            variant="outline"
          >
            Contact us
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function LegalPage({ body, document }: LegalPageProps) {
  const policy = parsePolicySections(body);
  if (!policy) return <RichTextPage body={body} title={document.title} />;

  return (
    <Page>
      <Container>
        <div className="grid gap-10 desktop:grid-cols-[minmax(0,40rem)_15rem] desktop:items-start desktop:justify-between desktop:gap-x-24">
          <div className="grid min-w-0 gap-10">
            <header className="grid gap-3 border-b border-rule pb-6">
              <h1 className="type-display">{document.title}</h1>
            </header>
            <MobilePolicyNav sections={policy.sections} />
            {policy.intro ? (
              <Prose>
                <div
                  // oxlint-disable-next-line react/no-danger -- Page and policy bodies pass through sanitizeShopifyHtml when fetched.
                  dangerouslySetInnerHTML={{ __html: policy.intro }}
                />
              </Prose>
            ) : null}
            {policy.sections.map((section) => (
              <section
                className="scroll-mt-24 border-b border-rule pb-8 last:border-b-0 last:pb-0"
                id={section.id}
                key={section.id}
              >
                <Prose>
                  <div
                    // oxlint-disable-next-line react/no-danger -- Page and policy bodies pass through sanitizeShopifyHtml when fetched.
                    dangerouslySetInnerHTML={{ __html: section.html }}
                  />
                </Prose>
              </section>
            ))}
          </div>
          <PolicyRail document={document} sections={policy.sections} />
        </div>
      </Container>
    </Page>
  );
}
