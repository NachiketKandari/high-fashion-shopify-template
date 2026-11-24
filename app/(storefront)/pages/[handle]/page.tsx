import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  type LegalDocumentHandle,
  LEGAL_DOCUMENTS,
  LegalPage,
} from "@/components/content/legal-page";
import { RichTextPage, RichTextPageSkeleton } from "@/components/content/rich-text-page";
import { getPage } from "@/lib/pages/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { getShopifySitemapPage } from "@/lib/seo/server";
import { PLACEHOLDER_HANDLE } from "@/lib/static-params";

export async function generateStaticParams() {
  try {
    const { items } = await getShopifySitemapPage("PAGE", 1);
    return items.length > 0
      ? items.map(({ handle }) => ({ handle }))
      : [{ handle: PLACEHOLDER_HANDLE }];
  } catch {
    return [{ handle: PLACEHOLDER_HANDLE }];
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/pages/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  if (handle === PLACEHOLDER_HANDLE) return {};
  const page = await getPage({
    handle,
  });
  if (!page) notFound();
  const pathname = `/pages/${page.handle}`;
  const legal = LEGAL_DOCUMENTS[page.handle as LegalDocumentHandle];
  const title = legal?.title ?? page.seo.title;
  return {
    alternates: buildAlternates({ pathname }),
    description: page.seo.description,
    openGraph: buildOpenGraph({
      description: page.seo.description,
      title,
      type: "website",
      url: pathname,
    }),
    title,
  };
}

export default function ShopifyPage({ params }: PageProps<"/pages/[handle]">) {
  return (
    <Suspense fallback={<RichTextPageSkeleton />}>
      <ShopifyPageContent params={params} />
    </Suspense>
  );
}

async function ShopifyPageContent({ params }: Pick<PageProps<"/pages/[handle]">, "params">) {
  const { handle } = await params;
  if (handle === PLACEHOLDER_HANDLE) notFound();
  const page = await getPage({
    handle,
  });
  if (!page) notFound();
  const legal = LEGAL_DOCUMENTS[page.handle as LegalDocumentHandle];
  if (legal) return <LegalPage body={page.body} document={legal} />;
  return <RichTextPage body={page.body} title={page.title} />;
}
