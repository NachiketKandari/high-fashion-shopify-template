#!/usr/bin/env node
/**
 * Imports a published reference catalog from a live storefront into this Shopify store.
 *
 * The live storefront is Shopify-backed, so the public /products.json and /collections.json
 * endpoints are the source of truth for handles, images, descriptions, options and variants.
 * Prices are INR; this store is USD, so they are converted at the approximate rate the live
 * storefront shows for USD and rounded to whole dollars.
 *
 * Requires the same Admin app scopes as scripts/seed-catalog.mjs:
 *   read_products, write_products, read_publications, write_publications, read_files, write_files
 *
 * Run:
 *   pnpm import:catalog
 *   pnpm import:catalog -- --limit=1 --dry-run
 *   pnpm import:catalog -- --only=alma-lace-corset-top
 *   pnpm import:catalog -- --skip-imported
 *
 * Flags:
 *   --ref=<url>        Reference storefront (default https://politesocietyshop.com)
 *   --rate=<number>    INR per USD used by the live currency display (default 94.83)
 *   --limit=<number>   Import the first N products
 *   --only=<handles>   Comma-separated product handles
 *   --dry-run          Print the transformed first product and exit
 *   --skip-imported    Skip products whose variant and media counts already match
 *   --resume           Skip handles recorded as complete in import-progress.json
 *   --no-media         Do not import or replace product images
 *   --no-inventory     Do not track inventory or mirror sold-out variants
 *   --no-collections   Create products only
 *   --collections-only Sync collection membership without touching products
 *   --no-publish       Do not publish to the Headless channel
 *   --refresh          Refetch the reference catalog instead of using the cache
 *   --unpublish-others Unpublish products and collections that are not in the live catalog
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const args = parseArgs(process.argv.slice(2));
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const version = process.env.SHOPIFY_API_VERSION ?? "2026-10";
const dryRun = args["dry-run"] || process.env.DRY_RUN === "1";
const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
const referenceUrl = String(args.ref ?? "https://politesocietyshop.com").replace(/\/$/, "");
const inrPerUsd = Number(args.rate ?? 94.83);
const onlyHandles = args.only
  ? new Set(
      String(args.only)
        .split(",")
        .map((handle) => handle.trim())
        .filter(Boolean),
    )
  : null;
const limit = args.limit ? Number(args.limit) : null;
const replaceMedia = !args["no-media"];
const syncInventory = !args["no-inventory"];
const syncCollections = !args["no-collections"];
const collectionsOnly = Boolean(args["collections-only"]);
const publish = !args["no-publish"];
const skipImported = Boolean(args["skip-imported"]);
const resume = Boolean(args.resume);
const refresh = Boolean(args.refresh);
const shouldUnpublishOthers =
  Boolean(args["unpublish-others"]) || process.env.UNPUBLISH_OTHERS === "1";

const outputDir = ".catalog-import";
const cacheFile = join(outputDir, "live-catalog.json");
const progressFile = join(outputDir, "import-progress.json");
const reportFile = join(outputDir, "import-report.json");

if (!dryRun && (!domain || (!staticToken && !(clientId && clientSecret)))) {
  console.error(
    "Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and either SHOPIFY_ADMIN_ACCESS_TOKEN or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET.",
  );
  process.exit(1);
}

const endpoint = `https://${domain}/admin/api/${version}/graphql.json`;
let accessToken = staticToken;

function parseArgs(argv) {
  const parsed = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [key, ...rest] = arg.slice(2).split("=");
    parsed[key] = rest.length > 0 ? rest.join("=") : true;
  }
  return parsed;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

async function admin(query, variables = {}, attempt = 0) {
  const token = await getAccessToken();
  const response = await fetch(endpoint, {
    body: JSON.stringify({ query, variables }),
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    method: "POST",
  });
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(
      `Shopify Admin API returned non-JSON (${response.status}): ${text.slice(0, 300)}`,
    );
  }

  const throttled = payload.errors?.some(
    (error) => error.extensions?.code === "THROTTLED" || /throttled/i.test(error.message ?? ""),
  );
  if ((response.status === 429 || response.status >= 500 || throttled) && attempt < 5) {
    const wait = 1000 * 2 ** attempt;
    console.warn(`Shopify Admin API ${response.status || "throttled"}; retrying in ${wait}ms`);
    await sleep(wait);
    return admin(query, variables, attempt + 1);
  }
  if (!response.ok) {
    throw new Error(`Shopify Admin API ${response.status}: ${text.slice(0, 800)}`);
  }
  if (payload.errors?.length) {
    throw new Error(`Shopify Admin GraphQL errors: ${JSON.stringify(payload.errors, null, 2)}`);
  }

  const available = payload.extensions?.cost?.throttleStatus?.currentlyAvailable;
  if (typeof available === "number" && available < 250) await sleep(1000);
  return payload.data;
}

async function fetchReference(path) {
  const response = await fetch(`${referenceUrl}${path}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "high-fashion-template-catalog-import/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`Reference ${path} returned ${response.status}`);
  }
  return response.json();
}

async function fetchPaginated(path, key, limitPerPage = 250) {
  const items = [];
  for (let page = 1; ; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    const payload = await fetchReference(`${path}${separator}limit=${limitPerPage}&page=${page}`);
    const batch = payload[key] ?? [];
    items.push(...batch);
    if (batch.length < limitPerPage) break;
    await sleep(100);
  }
  return items;
}

async function loadCatalog() {
  if (!refresh && existsSync(cacheFile)) {
    console.log(`using cached catalog ${cacheFile}`);
    return JSON.parse(readFileSync(cacheFile, "utf8"));
  }

  console.log(`fetching catalog from ${referenceUrl}`);
  const products = await fetchPaginated("/products.json", "products");
  const collections = await fetchPaginated("/collections.json", "collections");
  const collectionMembers = [];

  for (const collection of collections) {
    if (!collection.handle) continue;
    const members = await fetchPaginated(
      `/collections/${encodeURIComponent(collection.handle)}/products.json`,
      "products",
    );
    collectionMembers.push({
      handle: collection.handle,
      productHandles: members.map((product) => product.handle),
      title: collection.title,
    });
    console.log(`fetched ${members.length} products for ${collection.handle}`);
  }

  const catalog = {
    collections: collectionMembers,
    fetchedAt: new Date().toISOString(),
    products,
    referenceUrl,
  };
  mkdirSync(dirname(cacheFile), { recursive: true });
  writeFileSync(cacheFile, JSON.stringify(catalog, null, 2));
  return catalog;
}

function normalizeOptionName(name) {
  const cleaned = String(name ?? "")
    .trim()
    .replace(/\s+/g, " ");
  const lower = cleaned.toLowerCase();
  if (lower === "color" || lower === "colour") return "Colour";
  if (lower === "size") return "Size";
  if (lower === "back") return "Back";
  return cleaned;
}

function normalizeValue(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function imageExtension(url) {
  const pathname = new URL(url).pathname;
  const extension = pathname.split(".").pop()?.toLowerCase();
  if (!extension || !/^(avif|gif|jpeg|jpg|png|webp)$/.test(extension)) return "jpg";
  return extension === "jpeg" ? "jpg" : extension;
}

function safeFilenamePart(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function convertPrice(value, currency, productHandle) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) throw new Error(`${productHandle}: invalid price ${value}`);
  if (currency === "INR") return amount.toFixed(2);
  if (currency !== "USD") {
    throw new Error(`${productHandle}: unsupported shop currency ${currency}`);
  }
  return Math.max(1, Math.round(amount / inrPerUsd)).toFixed(2);
}

function buildProductInput(product, options) {
  const images = [];
  const seenSources = new Set();
  for (const image of product.images ?? []) {
    if (!image?.src || seenSources.has(image.src)) continue;
    seenSources.add(image.src);
    images.push(image);
  }

  const filesBySource = new Map();
  const files = replaceMedia
    ? images.map((image, index) => {
        const filename = `${safeFilenamePart(product.handle)}-${String(index + 1).padStart(2, "0")}.${imageExtension(image.src)}`;
        const file = {
          alt: `${product.title} image ${index + 1}`,
          contentType: "IMAGE",
          filename,
          originalSource: image.src,
        };
        filesBySource.set(image.src, file);
        return file;
      })
    : [];

  const optionNames = (product.options ?? []).map((option) => normalizeOptionName(option.name));
  const canonicalValues = optionNames.map(() => new Map());

  for (const [index, option] of (product.options ?? []).entries()) {
    for (const value of option.values ?? []) {
      const normalized = normalizeValue(value);
      if (normalized) canonicalValues[index].set(normalized.toLowerCase(), normalized);
    }
  }
  for (const variant of product.variants ?? []) {
    for (let index = 0; index < optionNames.length; index += 1) {
      const raw = variant[`option${index + 1}`];
      if (raw == null) continue;
      const normalized = normalizeValue(raw);
      if (normalized && !canonicalValues[index].has(normalized.toLowerCase())) {
        canonicalValues[index].set(normalized.toLowerCase(), normalized);
      }
    }
  }

  const productOptions = optionNames.map((name, index) => ({
    name,
    position: index + 1,
    values: [...canonicalValues[index].values()].map((value) => ({ name: value })),
  }));

  const trackInventory = syncInventory && Boolean(options.locationId);
  const variants = (product.variants ?? []).map((variant, index) => {
    const optionValues = optionNames.flatMap((optionName, optionIndex) => {
      const raw = variant[`option${optionIndex + 1}`];
      if (raw == null) return [];
      const normalized = normalizeValue(raw);
      const canonical = canonicalValues[optionIndex].get(normalized.toLowerCase()) ?? normalized;
      return [{ name: canonical, optionName }];
    });

    const price = convertPrice(variant.price, options.currency, product.handle);
    const compareAtPrice = variant.compare_at_price
      ? convertPrice(variant.compare_at_price, options.currency, product.handle)
      : null;
    const sku =
      variant.sku?.trim() ||
      `${product.handle}-${optionValues.map((value) => safeFilenamePart(value.name)).join("-")}`;
    const featuredSource = variant.featured_image?.src;
    const file = featuredSource ? filesBySource.get(featuredSource) : undefined;

    const result = {
      inventoryItem: {
        requiresShipping: variant.requires_shipping !== false,
        sku,
        tracked: trackInventory,
      },
      inventoryPolicy: trackInventory ? "DENY" : "CONTINUE",
      optionValues,
      position: index + 1,
      price,
      taxable: Boolean(variant.taxable),
    };
    if (compareAtPrice) result.compareAtPrice = compareAtPrice;
    if (file) result.file = file;
    if (trackInventory && options.locationId) {
      result.inventoryQuantities = [
        {
          locationId: options.locationId,
          name: "available",
          quantity: variant.available ? 100 : 0,
        },
      ];
    }
    return result;
  });

  return {
    descriptionHtml: product.body_html ?? "",
    files,
    handle: product.handle,
    productOptions,
    productType: product.product_type || undefined,
    status: "ACTIVE",
    tags: (product.tags ?? []).filter(Boolean),
    title: product.title,
    variants,
    vendor: product.vendor || "Lorem Ipsum",
  };
}

const PRODUCT_SET = `#graphql
  mutation ProductSet($identifier: ProductSetIdentifiers, $input: ProductSetInput!, $synchronous: Boolean!) {
    productSet(identifier: $identifier, input: $input, synchronous: $synchronous) {
      product { id handle }
      userErrors { field message }
    }
  }
`;

const PRODUCT_BY_HANDLE = `#graphql
  query ProductByHandle($query: String!) {
    products(first: 5, query: $query) {
      nodes {
        id
        handle
        mediaCount { count }
        variantsCount { count }
        media(first: 100) { nodes { id } }
      }
    }
  }
`;

const PRODUCTS_FIRST = `#graphql
  query ProductsFirst($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes { id handle }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const PRODUCT_DELETE_MEDIA = `#graphql
  mutation ProductDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
    productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
      deletedMediaIds
      userErrors { field message }
    }
  }
`;

const COLLECTION_CREATE = `#graphql
  mutation CollectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id handle }
      userErrors { field message }
    }
  }
`;

const COLLECTION_UPDATE = `#graphql
  mutation CollectionUpdate($input: CollectionUpdateInput!) {
    collectionUpdate(collection: $input) {
      collection { id handle }
      userErrors { field message }
    }
  }
`;

const COLLECTION_PRODUCTS = `#graphql
  query CollectionProducts($id: ID!, $after: String) {
    collection(id: $id) {
      products(first: 250, after: $after) {
        nodes { id handle }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const COLLECTION_ADD = `#graphql
  mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
    collectionAddProducts(id: $id, productIds: $productIds) {
      collection { id handle }
      userErrors { field message }
    }
  }
`;

const COLLECTION_REMOVE = `#graphql
  mutation CollectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
    collectionRemoveProducts(id: $id, productIds: $productIds) {
      userErrors { field message }
    }
  }
`;

const PUBLISHABLE_PUBLISH = `#graphql
  mutation PublishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }
`;

const PUBLISHABLE_UNPUBLISH = `#graphql
  mutation PublishableUnpublish($id: ID!, $input: [PublicationInput!]!) {
    publishableUnpublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }
`;

const PUBLICATIONS = `#graphql
  query Publications {
    publications(first: 20) {
      nodes { id name }
    }
  }
`;

const SHOP_SETTINGS = `#graphql
  query ShopSettings {
    shop { currencyCode ianaTimezone name }
  }
`;

const PUBLISHED_PRODUCTS = `#graphql
  query PublishedProducts($first: Int!, $after: String, $publicationId: ID!) {
    products(first: $first, after: $after) {
      nodes { id handle publishedOnPublication(publicationId: $publicationId) }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const PUBLISHED_COLLECTIONS = `#graphql
  query PublishedCollections($first: Int!, $after: String, $publicationId: ID!) {
    collections(first: $first, after: $after) {
      nodes { id handle publishedOnPublication(publicationId: $publicationId) }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

let publicationId;

async function getPublicationId() {
  if (publicationId !== undefined) return publicationId;
  if (process.env.SHOPIFY_PUBLICATION_ID) {
    publicationId = process.env.SHOPIFY_PUBLICATION_ID;
    return publicationId;
  }
  const data = await admin(PUBLICATIONS);
  const match = data.publications.nodes.find(({ name }) =>
    /headless|hydrogen|storefront/i.test(name),
  );
  if (!match) {
    const available = data.publications.nodes.map(({ name }) => name).join(", ") || "none";
    console.warn(
      `No Headless publication found; set SHOPIFY_PUBLICATION_ID. Available: ${available}`,
    );
    publicationId = null;
    return publicationId;
  }
  console.log(`publishing to ${match.name}`);
  publicationId = match.id;
  return publicationId;
}

async function publishResource(id) {
  const target = await getPublicationId();
  if (!target) return;
  const data = await admin(PUBLISHABLE_PUBLISH, {
    id,
    input: [{ publicationId: target }],
  });
  const errors = data.publishablePublish.userErrors;
  if (errors.length) throw new Error(`publish ${id}: ${JSON.stringify(errors)}`);
}

async function unpublishResource(id) {
  const target = await getPublicationId();
  if (!target) return;
  const data = await admin(PUBLISHABLE_UNPUBLISH, {
    id,
    input: [{ publicationId: target }],
  });
  const errors = data.publishableUnpublish.userErrors;
  if (errors.length) throw new Error(`unpublish ${id}: ${JSON.stringify(errors)}`);
}

async function findProduct(handle) {
  const data = await admin(PRODUCT_BY_HANDLE, { query: `handle:${handle}` });
  return data.products.nodes.find((node) => node.handle === handle) ?? null;
}

async function listProductIds() {
  const map = new Map();
  let after = null;
  do {
    const data = await admin(PRODUCTS_FIRST, { after, first: 250 });
    for (const product of data.products.nodes) map.set(product.handle, product.id);
    after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (after);
  return map;
}

async function findCollection(handle) {
  const data = await admin(
    `#graphql
      query FindCollection($query: String!) {
        collections(first: 1, query: $query) { nodes { id handle title } }
      }
    `,
    { query: `handle:${handle}` },
  );
  return data.collections.nodes[0] ?? null;
}

async function collectionProductIds(collectionId) {
  const ids = [];
  let after = null;
  do {
    const data = await admin(COLLECTION_PRODUCTS, { after, id: collectionId });
    ids.push(...data.collection.products.nodes.map(({ id }) => id));
    after = data.collection.products.pageInfo.hasNextPage
      ? data.collection.products.pageInfo.endCursor
      : null;
  } while (after);
  return ids;
}

async function deleteMedia(product) {
  if (!replaceMedia || !product?.media?.nodes?.length) return;
  const data = await admin(PRODUCT_DELETE_MEDIA, {
    mediaIds: product.media.nodes.map(({ id }) => id),
    productId: product.id,
  });
  const errors = data.productDeleteMedia.userErrors;
  if (errors.length) throw new Error(`delete media ${product.handle}: ${JSON.stringify(errors)}`);
}

async function importProduct(product, options) {
  const input = buildProductInput(product, options);
  const existing = await findProduct(product.handle);

  if (skipImported && existing) {
    const expectedVariants = product.variants?.length ?? 0;
    const expectedMedia = replaceMedia ? (product.images?.length ?? 0) : existing.mediaCount.count;
    if (
      existing.variantsCount.count === expectedVariants &&
      existing.mediaCount.count === expectedMedia
    ) {
      console.log(`skip ${product.handle}`);
      return { id: existing.id, status: "skipped" };
    }
  }

  await deleteMedia(existing);
  const identifier = existing ? { id: existing.id } : { handle: product.handle };
  let data;
  try {
    data = await admin(PRODUCT_SET, { identifier, input, synchronous: true });
  } catch (error) {
    if (existing) throw error;
    console.warn(`${product.handle}: handle identifier failed, retrying create`);
    data = await admin(PRODUCT_SET, { input, synchronous: true });
  }
  const errors = data.productSet.userErrors;
  if (errors.length) throw new Error(`${product.handle}: ${JSON.stringify(errors)}`);

  const productId = data.productSet.product.id;
  if (publish) await publishResource(productId);
  console.log(
    `${existing ? "updated" : "created"} ${product.handle} (${input.variants.length} variants, ${input.files.length} images)`,
  );
  return { id: productId, status: existing ? "updated" : "created" };
}

async function syncCollection(collection, productIdsByHandle) {
  const existing = await findCollection(collection.handle);
  let collectionId;
  if (existing) {
    const data = await admin(COLLECTION_UPDATE, {
      input: { id: existing.id, title: collection.title },
    });
    const errors = data.collectionUpdate.userErrors;
    if (errors.length)
      throw new Error(`update collection ${collection.handle}: ${JSON.stringify(errors)}`);
    collectionId = existing.id;
    console.log(`updated collection ${collection.handle}`);
  } else {
    const data = await admin(COLLECTION_CREATE, {
      input: { handle: collection.handle, title: collection.title },
    });
    const errors = data.collectionCreate.userErrors;
    if (errors.length)
      throw new Error(`create collection ${collection.handle}: ${JSON.stringify(errors)}`);
    collectionId = data.collectionCreate.collection.id;
    console.log(`created collection ${collection.handle}`);
  }

  if (publish) await publishResource(collectionId);

  const desiredIds = collection.productHandles
    .map((handle) => productIdsByHandle.get(handle))
    .filter(Boolean);
  const currentIds = await collectionProductIds(collectionId);
  const current = new Set(currentIds);
  const desired = new Set(desiredIds);
  const toAdd = desiredIds.filter((id) => !current.has(id));
  const toRemove = currentIds.filter((id) => !desired.has(id));

  if (toAdd.length > 0) {
    const data = await admin(COLLECTION_ADD, { id: collectionId, productIds: toAdd });
    const errors = data.collectionAddProducts.userErrors;
    if (errors.length) throw new Error(`add to ${collection.handle}: ${JSON.stringify(errors)}`);
    console.log(`added ${toAdd.length} products to ${collection.handle}`);
  }
  if (toRemove.length > 0) {
    const data = await admin(COLLECTION_REMOVE, { id: collectionId, productIds: toRemove });
    const errors = data.collectionRemoveProducts.userErrors;
    if (errors.length)
      throw new Error(`remove from ${collection.handle}: ${JSON.stringify(errors)}`);
    console.log(`removed ${toRemove.length} products from ${collection.handle}`);
  }
  return { added: toAdd.length, removed: toRemove.length };
}

async function unpublishOthers(keepProductHandles, keepCollectionHandles) {
  const publication = await getPublicationId();
  if (!publication) return { collections: 0, products: 0 };

  const resources = [
    {
      connection: "products",
      keep: keepProductHandles,
      label: "product",
      query: PUBLISHED_PRODUCTS,
    },
    {
      connection: "collections",
      keep: keepCollectionHandles,
      label: "collection",
      query: PUBLISHED_COLLECTIONS,
    },
  ];
  const counts = { collections: 0, products: 0 };

  for (const resource of resources) {
    let after = null;
    do {
      const data = await admin(resource.query, {
        after,
        first: 100,
        publicationId: publication,
      });
      const connection = data[resource.connection];
      for (const node of connection.nodes) {
        if (!node.publishedOnPublication || resource.keep.has(node.handle)) continue;
        await unpublishResource(node.id);
        counts[resource.connection] += 1;
        console.log(`unpublished ${resource.label} ${node.handle}`);
      }
      after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
    } while (after);
  }
  return counts;
}

async function main() {
  const startedAt = new Date().toISOString();
  const catalog = await loadCatalog();
  let products = catalog.products.filter((product) => product.handle);
  if (onlyHandles) products = products.filter((product) => onlyHandles.has(product.handle));
  if (limit) products = products.slice(0, limit);

  if (products.length === 0) throw new Error("No products selected.");

  const report = {
    collections: { created: 0, failed: 0, skipped: 0, updated: 0 },
    errors: [],
    finishedAt: null,
    products: { created: 0, failed: 0, skipped: 0, updated: 0 },
    referenceUrl,
    startedAt,
    unpublished: { collections: 0, products: 0 },
  };

  let currency = "USD";
  const locationId = args["location-id"] ? String(args["location-id"]) : null;
  if (!dryRun) {
    const settings = await admin(SHOP_SETTINGS);
    currency = settings.shop.currencyCode;
    console.log(
      `shop ${settings.shop.name} (${currency}); inventory location ${locationId ?? "none"}`,
    );
    if (!locationId && syncInventory) {
      console.warn(
        "No --location-id supplied; variants stay untracked and available. Add read_locations + write_inventory scopes and pass the location ID to mirror sold-out variants.",
      );
    }
  }

  const options = { currency, locationId };
  if (dryRun) {
    console.log(JSON.stringify(buildProductInput(products[0], options), null, 2));
    return;
  }

  mkdirSync(outputDir, { recursive: true });
  const completed = new Set(
    existsSync(progressFile)
      ? (JSON.parse(readFileSync(progressFile, "utf8")).completed ?? [])
      : [],
  );

  let productIdsByHandle = await listProductIds();
  if (!collectionsOnly) {
    for (const [index, product] of products.entries()) {
      if (resume && completed.has(product.handle)) {
        console.log(`resume-skip ${product.handle}`);
        report.products.skipped += 1;
        continue;
      }
      console.log(`[${index + 1}/${products.length}] ${product.handle}`);
      try {
        const result = await importProduct(product, options);
        productIdsByHandle.set(product.handle, result.id);
        report.products[result.status] += 1;
        completed.add(product.handle);
        writeFileSync(progressFile, JSON.stringify({ completed: [...completed] }, null, 2));
      } catch (error) {
        console.error(`failed ${product.handle}: ${error.message}`);
        report.errors.push({ error: error.message, product: product.handle });
        report.products.failed += 1;
      }
      await sleep(300);
    }
  }

  if (syncCollections) {
    for (const collection of catalog.collections) {
      try {
        const result = await syncCollection(collection, productIdsByHandle);
        if (result.added || result.removed) report.collections.updated += 1;
        else report.collections.skipped += 1;
      } catch (error) {
        console.error(`failed collection ${collection.handle}: ${error.message}`);
        report.errors.push({ collection: collection.handle, error: error.message });
        report.collections.failed += 1;
      }
      await sleep(200);
    }
  }

  if (shouldUnpublishOthers) {
    const keepProducts = new Set(catalog.products.map(({ handle }) => handle));
    const keepCollections = new Set(catalog.collections.map(({ handle }) => handle));
    report.unpublished = await unpublishOthers(keepProducts, keepCollections);
  }

  report.finishedAt = new Date().toISOString();
  writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (report.errors.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
