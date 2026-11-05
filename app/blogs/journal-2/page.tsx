import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";
import { JOURNAL_ARTICLES } from "@/lib/content/journal";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const DESCRIPTION =
  "Stories from the Polite Society world: city guides, conversations and the things we are watching.";

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/blogs/journal-2" }),
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    description: DESCRIPTION,
    title: "Journal",
    type: "website",
    url: "/blogs/journal-2",
  }),
  title: "Journal",
};

export default function JournalPage() {
  return (
    <Page className="pt-8 pb-24">
      <Container>
        <h1 className="text-lg uppercase leading-[23px] tracking-wider">Journal</h1>
        <div className="mt-8 grid gap-x-[3px] gap-y-12 md:grid-cols-3">
          {JOURNAL_ARTICLES.map((article) => {
            const date = new Intl.DateTimeFormat(shopConfig.localization.locale, {
              dateStyle: "long",
            }).format(new Date(article.publishedAt));
            return (
              <article className="grid content-start gap-4" key={article.handle}>
                <Link
                  className="group relative block aspect-[3/4] overflow-hidden bg-surface"
                  href={`/blogs/${article.blogHandle}/${article.handle}`}
                >
                  <Image
                    alt={article.image?.altText ?? article.title}
                    className="object-cover transition-transform duration-600 group-hover:scale-[1.03]"
                    fill
                    sizes="100vw"
                    src={article.image?.url ?? "/og-default.png"}
                  />
                </Link>
                <div className="grid gap-2.5">
                  <time
                    className="text-2xs uppercase tracking-wider text-muted-foreground"
                    dateTime={article.publishedAt}
                  >
                    {date}
                  </time>
                  <h2 className="text-2xs uppercase tracking-wider">
                    <Link
                      className="transition-opacity hover:opacity-60"
                      href={`/blogs/${article.blogHandle}/${article.handle}`}
                    >
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-sm font-light leading-[21px] tracking-wide text-muted-foreground">
                    {article.excerpt}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </Page>
  );
}
