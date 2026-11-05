import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Prose } from "@/components/ui/prose";
import { Skeleton } from "@/components/ui/skeleton";
import { shopConfig } from "@/lib/config";
import { getJournalArticle, JOURNAL_ARTICLES } from "@/lib/content/journal";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { sanitizeShopifyHtml } from "@/lib/shopify/html/server";

export function generateStaticParams() {
  return JOURNAL_ARTICLES.map((article) => ({ articleHandle: article.handle }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blogs/journal-2/[articleHandle]">): Promise<Metadata> {
  const { articleHandle } = await params;
  const article = getJournalArticle(articleHandle);
  if (!article) return {};
  const pathname = `/blogs/${article.blogHandle}/${article.handle}`;
  return {
    alternates: buildAlternates({ pathname }),
    description: article.seo.description,
    openGraph: buildOpenGraph({
      description: article.seo.description,
      images: article.image
        ? [
            {
              alt: article.image.altText,
              height: article.image.height,
              url: article.image.url,
              width: article.image.width,
            },
          ]
        : ["/og-default.png"],
      title: article.seo.title,
      type: "article",
      url: pathname,
    }),
    title: article.seo.title,
    twitter: {
      card: "summary_large_image",
      description: article.seo.description,
      images: article.image ? [article.image.url] : ["/og-default.png"],
      title: article.seo.title,
    },
  };
}

export default function JournalArticlePage({
  params,
}: PageProps<"/blogs/journal-2/[articleHandle]">) {
  return (
    <Suspense fallback={<JournalArticleSkeleton />}>
      <JournalArticleContent params={params} />
    </Suspense>
  );
}

export function JournalArticleSkeleton() {
  return (
    <Page aria-busy="true" className="pt-8 pb-24">
      <Container className="max-w-4xl">
        <Skeleton className="h-3 w-20" />
        <div className="mt-5 grid gap-3 border-b border-rule pb-6">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="mt-6 aspect-[3/2] w-full" />
        <div className="mx-auto mt-10 grid w-full max-w-2xl gap-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </Container>
    </Page>
  );
}

async function JournalArticleContent({
  params,
}: Pick<PageProps<"/blogs/journal-2/[articleHandle]">, "params">) {
  const { articleHandle } = await params;
  const article = getJournalArticle(articleHandle);
  if (!article) notFound();

  const date = new Intl.DateTimeFormat(shopConfig.localization.locale, {
    dateStyle: "long",
  }).format(new Date(article.publishedAt));
  const others = JOURNAL_ARTICLES.filter((entry) => entry.handle !== article.handle);

  return (
    <Page className="pt-8 pb-24">
      <Container className="max-w-4xl">
        <Link
          className="text-2xs uppercase tracking-wider text-muted-foreground transition-opacity hover:opacity-60"
          href="/blogs/journal-2"
        >
          Journal
        </Link>
        <header className="mt-5 grid gap-3 border-b border-rule pb-6">
          <h1 className="max-w-3xl text-2xl uppercase leading-[1.2] tracking-wider md:text-3xl">
            {article.title}
          </h1>
          <time
            className="text-2xs uppercase tracking-wider text-muted-foreground"
            dateTime={article.publishedAt}
          >
            {date}
          </time>
        </header>

        {article.image ? (
          <div className="relative mt-6 aspect-[3/2] overflow-hidden bg-surface">
            <Image
              alt={article.image.altText}
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src={article.image.url}
            />
          </div>
        ) : null}

        <Prose className="mx-auto mt-10 w-full max-w-2xl text-sm">
          <div
            // oxlint-disable-next-line react/no-danger -- Local journal bodies are sanitized before rendering.
            dangerouslySetInnerHTML={{ __html: sanitizeShopifyHtml(article.body ?? "") }}
          />
        </Prose>

        <nav
          aria-label="More journal stories"
          className="mt-16 grid gap-4 border-t border-rule pt-6"
        >
          <p className="text-2xs uppercase tracking-wider text-muted-foreground">More stories</p>
          {others.map((entry) => (
            <Link
              className="text-sm font-light tracking-wide transition-opacity hover:opacity-60"
              href={`/blogs/${entry.blogHandle}/${entry.handle}`}
              key={entry.handle}
            >
              {entry.title}
            </Link>
          ))}
        </nav>
      </Container>
    </Page>
  );
}
