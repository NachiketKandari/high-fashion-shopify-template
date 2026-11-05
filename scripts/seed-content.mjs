#!/usr/bin/env node
/**
 * Seeds Shopify pages and journal articles for the Lorem Ipsum storefront.
 *
 * Requires an Admin app with write_online_store_pages and write_files.
 * Authenticate with a Dev Dashboard app (client ID + secret) or SHOPIFY_ADMIN_ACCESS_TOKEN.
 *
 * Run:
 *   pnpm seed:content
 *
 * Create-only by default so merchant edits are never overwritten. Use UPDATE=1 to
 * replace existing page and article bodies from this script.
 *
 * Other flags:
 *   DRY_RUN=1          List what would change without writing.
 *   UPLOAD_IMAGES=0    Keep local /reference image paths instead of Shopify Files.
 *   REVALIDATE_URL=... Optional deployed /api/revalidate URL.
 *   REVALIDATE_SECRET=... Bearer token for that endpoint.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { JOURNAL_ARTICLES } from "./content/journal.mjs";
import { PAGES } from "./content/pages.mjs";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const version = process.env.SHOPIFY_API_VERSION ?? "2026-10";
const dryRun = process.env.DRY_RUN === "1";
const update = process.env.UPDATE === "1";
const uploadImages = process.env.UPLOAD_IMAGES !== "0";
const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!dryRun && (!domain || (!staticToken && !(clientId && clientSecret)))) {
  console.error(
    "Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and either SHOPIFY_ADMIN_ACCESS_TOKEN or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET.",
  );
  process.exit(1);
}

const endpoint = `https://${domain}/admin/api/${version}/graphql.json`;
const cachePath = path.join(process.cwd(), ".seed-content-cache.json");
let accessToken = staticToken;
let imageCache = {};

try {
  imageCache = JSON.parse(await readFile(cachePath, "utf8"));
} catch {
  imageCache = {};
}

async function getAccessToken() {
  if (accessToken) return accessToken;
  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(`Client credentials grant failed: ${JSON.stringify(payload)}`);
  }
  accessToken = payload.access_token;
  return accessToken;
}

async function admin(query, variables = {}) {
  const token = await getAccessToken();
  const response = await fetch(endpoint, {
    body: JSON.stringify({ query, variables }),
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Shopify Admin API ${response.status}: ${await response.text()}`);
  }
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(JSON.stringify(payload.errors, null, 2));
  return payload.data;
}

function assertNoUserErrors(result, label) {
  if (result?.userErrors?.length) {
    throw new Error(`${label}: ${JSON.stringify(result.userErrors, null, 2)}`);
  }
}

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function saveImageCache() {
  await writeFile(cachePath, `${JSON.stringify(imageCache, null, 2)}\n`);
}

async function uploadImage(src, alt) {
  if (!uploadImages || src.startsWith("http")) return src;
  if (imageCache[src]) return imageCache[src];

  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  let file;
  try {
    file = await readFile(filePath);
  } catch {
    console.warn(`image missing, keeping local path: ${src}`);
    return src;
  }

  const filename = path.basename(filePath);
  const mimeType = MIME_TYPES[path.extname(filename).toLowerCase()] ?? "application/octet-stream";

  const staged = await admin(
    `#graphql
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          parameters { name value }
          resourceUrl
          url
        }
        userErrors { field message }
      }
    }`,
    {
      input: [{ filename, httpMethod: "POST", mimeType, resource: "IMAGE" }],
    },
  );
  assertNoUserErrors(staged.stagedUploadsCreate, `staged upload ${filename}`);

  const target = staged.stagedUploadsCreate.stagedTargets[0];
  if (!target) throw new Error(`No staged upload target for ${filename}`);

  const form = new FormData();
  for (const parameter of target.parameters) form.append(parameter.name, parameter.value);
  form.append("file", new Blob([file], { type: mimeType }), filename);

  const upload = await fetch(target.url, { body: form, method: "POST" });
  if (!upload.ok) {
    throw new Error(`Image upload failed for ${filename}: ${upload.status} ${await upload.text()}`);
  }

  const created = await admin(
    `#graphql
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
          fileStatus
          ... on MediaImage { image { url } }
        }
        userErrors { field message }
      }
    }`,
    { files: [{ alt, contentType: "IMAGE", originalSource: target.resourceUrl }] },
  );
  assertNoUserErrors(created.fileCreate, `fileCreate ${filename}`);

  let node = created.fileCreate.files[0];
  for (let attempt = 0; attempt < 60 && node; attempt += 1) {
    if (node.fileStatus === "READY" && node.image?.url) break;
    if (node.fileStatus === "FAILED") throw new Error(`Shopify could not process ${filename}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const polled = await admin(
      `#graphql
      query file($id: ID!) {
        node(id: $id) {
          ... on MediaImage { id fileStatus image { url } }
        }
      }`,
      { id: node.id },
    );
    node = polled.node;
  }

  if (!node?.image?.url) throw new Error(`Timed out processing ${filename}`);

  imageCache[src] = node.image.url;
  await saveImageCache();
  console.log(`uploaded image ${src}`);
  return node.image.url;
}

function absoluteUrl(src) {
  if (src.startsWith("http")) return src;
  return siteUrl ? new URL(src, siteUrl).toString() : src;
}

function rewriteImages(html) {
  return html.replace(/<img\b([^>]*?)src="([^"]+)"([^>]*?)>/g, (match, before, src, after) => {
    const resolved = imageCache[src] ?? absoluteUrl(src);
    if (!resolved.startsWith("https://cdn.shopify.com/")) {
      return `<img${before}src="${resolved}"${after}>`;
    }
    return `<img${before}src="${resolved}?width=1200" sizes="100vw" srcset="${resolved}?width=600 600w, ${resolved}?width=1200 1200w" loading="lazy"${after}>`;
  });
}

async function listPages() {
  const data = await admin(`#graphql
    query pages {
      pages(first: 250) {
        nodes { handle id }
      }
    }`);
  return new Map(data.pages.nodes.map((page) => [page.handle, page.id]));
}

async function listBlogs() {
  const data = await admin(`#graphql
    query blogs {
      blogs(first: 250) {
        nodes {
          articles(first: 250) { nodes { handle id } }
          handle
          id
        }
      }
    }`);
  return new Map(data.blogs.nodes.map((blog) => [blog.handle, blog]));
}

async function createPage(page) {
  const data = await admin(
    `#graphql
    mutation pageCreate($page: PageCreateInput!) {
      pageCreate(page: $page) {
        page { handle id }
        userErrors { field message }
      }
    }`,
    { page: { body: page.body, handle: page.handle, isPublished: true, title: page.title } },
  );
  assertNoUserErrors(data.pageCreate, `pageCreate ${page.handle}`);
  return data.pageCreate.page;
}

async function updatePage(id, page) {
  const data = await admin(
    `#graphql
    mutation pageUpdate($id: ID!, $page: PageUpdateInput!) {
      pageUpdate(id: $id, page: $page) {
        page { handle id }
        userErrors { field message }
      }
    }`,
    {
      id,
      page: { body: page.body, handle: page.handle, isPublished: true, title: page.title },
    },
  );
  assertNoUserErrors(data.pageUpdate, `pageUpdate ${page.handle}`);
  return data.pageUpdate.page;
}

async function createBlog() {
  const data = await admin(
    `#graphql
    mutation blogCreate($blog: BlogCreateInput!) {
      blogCreate(blog: $blog) {
        blog { handle id }
        userErrors { field message }
      }
    }`,
    { blog: { handle: "journal-2", title: "Journal" } },
  );
  assertNoUserErrors(data.blogCreate, "blogCreate journal-2");
  return data.blogCreate.blog;
}

async function createArticle(blogId, article, imageUrl) {
  const input = {
    author: { name: "Lorem Ipsum" },
    blogId,
    body: article.body,
    handle: article.handle,
    isPublished: true,
    publishDate: article.publishedAt,
    summary: article.excerpt,
    title: article.title,
  };
  if (imageUrl) {
    input.image = { altText: article.image?.altText ?? article.title, url: imageUrl };
  }

  const data = await admin(
    `#graphql
    mutation articleCreate($article: ArticleCreateInput!) {
      articleCreate(article: $article) {
        article { handle id }
        userErrors { field message }
      }
    }`,
    { article: input },
  );
  assertNoUserErrors(data.articleCreate, `articleCreate ${article.handle}`);
  return data.articleCreate.article;
}

async function updateArticle(id, article, imageUrl) {
  const input = {
    author: { name: "Lorem Ipsum" },
    body: article.body,
    handle: article.handle,
    isPublished: true,
    publishDate: article.publishedAt,
    summary: article.excerpt,
    title: article.title,
  };
  if (imageUrl) {
    input.image = { altText: article.image?.altText ?? article.title, url: imageUrl };
  }

  const data = await admin(
    `#graphql
    mutation articleUpdate($id: ID!, $article: ArticleUpdateInput!) {
      articleUpdate(id: $id, article: $article) {
        article { handle id }
        userErrors { field message }
      }
    }`,
    { id, article: input },
  );
  assertNoUserErrors(data.articleUpdate, `articleUpdate ${article.handle}`);
  return data.articleUpdate.article;
}

async function revalidate(tags) {
  const url = process.env.REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret || tags.length === 0) return;

  const target = new URL(url);
  for (const tag of tags) target.searchParams.append("tag", tag);
  const response = await fetch(target, {
    headers: { Authorization: `Bearer ${secret}` },
    method: "POST",
  });
  if (!response.ok) {
    console.warn(`revalidate failed: ${response.status} ${await response.text()}`);
    return;
  }
  console.log(`revalidated ${tags.length} tags`);
}

async function main() {
  const imageSources = new Set();
  for (const page of PAGES) {
    for (const match of page.body.matchAll(/src="(\/reference\/[^"]+)"/g)) {
      imageSources.add(match[1]);
    }
  }
  for (const article of JOURNAL_ARTICLES) {
    if (article.image?.url) imageSources.add(article.image.url);
  }

  console.log(
    `${PAGES.length} pages, ${JOURNAL_ARTICLES.length} articles, ${imageSources.size} images`,
  );

  if (dryRun) {
    console.log("DRY_RUN=1; no writes performed.");
    return;
  }

  if (uploadImages) {
    for (const src of imageSources) {
      try {
        await uploadImage(src, "");
      } catch (error) {
        console.warn(`image upload failed, keeping local path ${src}: ${error.message}`);
      }
    }
  }

  const pages = await listPages();
  for (const page of PAGES) {
    const existing = pages.get(page.handle);
    if (existing && !update) {
      console.log(`skip page ${page.handle} (exists; set UPDATE=1 to replace)`);
      continue;
    }
    const result = existing
      ? await updatePage(existing, { ...page, body: rewriteImages(page.body) })
      : await createPage({ ...page, body: rewriteImages(page.body) });
    console.log(`${existing ? "updated" : "created"} page ${result.handle}`);
  }

  const blogs = await listBlogs();
  const existingBlog = blogs.get("journal-2");
  const blog = existingBlog ?? (await createBlog());
  console.log(`${existingBlog ? "found" : "created"} blog ${blog.handle}`);

  const articles = new Map(
    (existingBlog?.articles?.nodes ?? []).map((article) => [article.handle, article.id]),
  );
  for (const article of JOURNAL_ARTICLES) {
    const existing = articles.get(article.handle);
    if (existing && !update) {
      console.log(`skip article ${article.handle} (exists; set UPDATE=1 to replace)`);
      continue;
    }
    const imageUrl = article.image?.url
      ? (imageCache[article.image.url] ?? absoluteUrl(article.image.url))
      : undefined;
    const result = existing
      ? await updateArticle(existing, article, imageUrl)
      : await createArticle(blog.id, article, imageUrl);
    console.log(`${existing ? "updated" : "created"} article ${result.handle}`);
  }

  const tags = [
    "pages",
    ...PAGES.map((page) => `page-${page.handle}`),
    "articles",
    "blogs",
    "blog-journal-2",
    ...JOURNAL_ARTICLES.map((article) => `article-journal-2-${article.handle}`),
  ];
  await revalidate(tags);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
