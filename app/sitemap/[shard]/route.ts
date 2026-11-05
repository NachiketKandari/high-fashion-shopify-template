import { notFound } from "next/navigation";

import { shopConfig } from "@/lib/config";
import { getShopPolicies } from "@/lib/policies/server";
import { getShopifySitemapPage, getShopifySitemapPagesCount } from "@/lib/seo/server";
import { type ShopifySitemapType } from "@/lib/shopify/operations/sitemap/types";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toAbsoluteUrl(pathname: string): string {
  return `${shopConfig.site.url}${pathname}`;
}

function urlsetWrap(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

const STATIC_CONTENT_PATHS = [
  "/pages/about-us",
  "/pages/lookbooks",
  "/pages/care-guide",
  "/pages/press-v2",
  "/pages/faqs",
  "/pages/contact-us",
  "/pages/size-guide",
  "/pages/shipping-returns",
  "/pages/returns-exchanges",
  "/pages/terms-of-service",
  "/pages/privacy-policies",
  "/blogs/journal-2",
  "/blogs/journal-2/guide-to-bombay-after-dark",
  "/blogs/journal-2/in-conversation-with-neetta",
  "/blogs/journal-2/the-polite-society-watchlist",
];

async function renderStatic(): Promise<Response> {
  const policies = await getShopPolicies().catch(() => []);
  const entries = [
    "/",
    ...STATIC_CONTENT_PATHS,
    ...policies.map(({ handle }) => `/policies/${handle}`),
  ]
    .map((pathname) => `  <url><loc>${escapeXml(toAbsoluteUrl(pathname))}</loc></url>`)
    .join("\n");
  return xmlResponse(urlsetWrap(entries));
}

async function renderShard(
  type: ShopifySitemapType,
  page: number,
  segment: string,
): Promise<Response> {
  if (page < 1 || page > (await getShopifySitemapPagesCount(type))) notFound();
  const { items } = await getShopifySitemapPage(type, page);

  const entries = items
    .map((item) => {
      const loc = escapeXml(toAbsoluteUrl(item.pathname ?? `/${segment}/${item.handle}`));
      const lastmod = escapeXml(item.updatedAt);
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join("\n");

  return xmlResponse(urlsetWrap(entries));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ shard: string }> },
): Promise<Response> {
  const { shard } = await params;
  const id = shard.endsWith(".xml") ? shard.slice(0, -".xml".length) : shard;

  if (id === "static") return renderStatic();

  const match = id.match(/^(articles|blogs|collections|pages|products)-(\d+)$/);
  if (!match) notFound();

  const segment = match[1];
  const types: Record<string, ShopifySitemapType> = {
    articles: "ARTICLE",
    blogs: "BLOG",
    collections: "COLLECTION",
    pages: "PAGE",
    products: "PRODUCT",
  };
  const type = types[segment];
  if (!type) notFound();

  return renderShard(type, Number(match[2]), segment);
}
