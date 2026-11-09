#!/usr/bin/env node
/**
 * Publishes the committed UniPlus fixture to the storefront sales channel.
 *
 * The storefront reads products and collections from the "Lorem Ipsum" publication.
 * This script turns on products that have media, a description and non-zero prices,
 * publishes them with their collections, and can replace the membership of the
 * New In collection. Products without media stay in DRAFT.
 *
 * Run:
 *   node --env-file=.env.local scripts/publish-uniplus-catalog.mjs --dry-run
 *   node --env-file=.env.local scripts/publish-uniplus-catalog.mjs --replace-new-in
 *   node --env-file=.env.local scripts/publish-uniplus-catalog.mjs --verify-only
 *
 * Flags:
 *   --dry-run           Print the plan and current state without writing.
 *   --verify-only       Check the current state and write a report; no writes.
 *   --replace-new-in    Make New In contain only publishable UniPlus products.
 *   --demote-blocked    Set blocked products back to DRAFT and unpublish them.
 *   --allow-partial-colours
 *                       Publish products even when a colourway has no image.
 *   --skip-products     Leave product status and publication unchanged.
 *   --skip-collections  Leave collection publication unchanged.
 *   --only=<handles>    Comma-separated product handles.
 *   --limit=<number>    First N selected products.
 *   --report[=<path>]   Report path, default .catalog-import/uniplus-publish-report.json.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const args = parseArgs(process.argv.slice(2));
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const version = process.env.SHOPIFY_API_VERSION ?? "2026-10";
const dryRun = Boolean(args["dry-run"]);
const verifyOnly = Boolean(args["verify-only"]);
const replaceNewIn = Boolean(args["replace-new-in"]);
const demoteBlocked = Boolean(args["demote-blocked"]);
const allowPartialColours = Boolean(args["allow-partial-colours"]);
const skipProducts = Boolean(args["skip-products"]);
const skipCollections = Boolean(args["skip-collections"]);
const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
const reportPath =
  typeof args.report === "string" ? args.report : ".catalog-import/uniplus-publish-report.json";
const fixturePath = join(dirname(fileURLToPath(import.meta.url)), "data", "uniplus-catalog.json");
const onlyHandles = args.only
  ? new Set(
      String(args.only)
        .split(",")
        .map((handle) => handle.trim())
        .filter(Boolean),
    )
  : null;
const limit = args.limit ? Number(args.limit) : null;

if (!domain) {
  console.error("Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN before publishing.");
  process.exit(1);
}
if (!staticToken && !(clientId && clientSecret)) {
  console.error(
    "Set either SHOPIFY_ADMIN_ACCESS_TOKEN or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET.",
  );
  process.exit(1);
}

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

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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
  const response = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
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
  if (!response.ok) throw new Error(`Shopify Admin API ${response.status}: ${text.slice(0, 800)}`);
  if (payload.errors?.length) {
    throw new Error(`Shopify Admin GraphQL errors: ${JSON.stringify(payload.errors, null, 2)}`);
  }
  return payload.data;
}

const PRODUCTS_QUERY = `#graphql
  query Products($after: String) {
    products(first: 100, after: $after) {
      nodes {
        id
        handle
        title
        status
        descriptionHtml
        mediaCount { count }
        media(first: 100) { nodes { status } }
        variants(first: 100) { nodes { sku price } }
        resourcePublications(first: 20) {
          nodes { publication { id name } isPublished }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const COLLECTIONS_QUERY = `#graphql
  query Collections($after: String) {
    collections(first: 100, after: $after) {
      nodes {
        id
        handle
        title
        resourcePublications(first: 20) {
          nodes { publication { id name } isPublished }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const COLLECTION_BY_HANDLE = `#graphql
  query CollectionByHandle($query: String!) {
    collections(first: 2, query: $query) {
      nodes {
        id
        handle
        title
        sources {
          __typename
          id
          ... on CollectionConditionsSource {
            targetType
            inclusion {
              selections(first: 250) { nodes { product { id handle } } }
            }
          }
        }
        resourcePublications(first: 20) {
          nodes { publication { id name } isPublished }
        }
      }
    }
  }
`;

const PUBLICATIONS = `#graphql
  query Publications {
    publications(first: 20) { nodes { id name } }
  }
`;

const PRODUCT_UPDATE = `#graphql
  mutation ProductUpdate($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product { id handle status }
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

const COLLECTION_UPDATE = `#graphql
  mutation CollectionUpdate($collection: CollectionUpdateInput!) {
    collectionUpdate(collection: $collection) {
      collection { id handle }
      userErrors { field message }
    }
  }
`;

function isPublishedTo(product, publicationId) {
  return product.resourcePublications.nodes.some(
    (publication) => publication.isPublished && publication.publication.id === publicationId,
  );
}

function publishBlockers(product, fixtureProduct) {
  const blockers = [];
  const readyMedia = product.media.nodes.filter((media) => media.status === "READY").length;
  if (product.mediaCount.count === 0) blockers.push("no media");
  else if (readyMedia === 0) blockers.push("media not ready");
  if (!product.descriptionHtml?.trim()) blockers.push("no description");
  if (product.variants.nodes.length === 0) blockers.push("no variants");
  if (product.variants.nodes.some((variant) => Number(variant.price) <= 0)) {
    blockers.push("zero price");
  }
  if (!allowPartialColours) {
    const missing = fixtureProduct.colourways
      .filter((colourway) => colourway.images.length === 0)
      .map((colourway) => colourway.name);
    if (missing.length > 0) blockers.push(`no image for ${missing.join(", ")}`);
  }
  return blockers;
}

async function fetchProducts() {
  const products = [];
  let after = null;
  do {
    const data = await admin(PRODUCTS_QUERY, { after });
    products.push(...data.products.nodes);
    after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (after);
  return products;
}

async function fetchCollections() {
  const collections = [];
  let after = null;
  do {
    const data = await admin(COLLECTIONS_QUERY, { after });
    collections.push(...data.collections.nodes);
    after = data.collections.pageInfo.hasNextPage ? data.collections.pageInfo.endCursor : null;
  } while (after);
  return collections;
}

async function getPublication() {
  if (process.env.SHOPIFY_PUBLICATION_ID) {
    const data = await admin(PUBLICATIONS);
    const configured = data.publications.nodes.find(
      (publication) => publication.id === process.env.SHOPIFY_PUBLICATION_ID,
    );
    if (configured) return configured;
    return { id: process.env.SHOPIFY_PUBLICATION_ID, name: "SHOPIFY_PUBLICATION_ID" };
  }
  const data = await admin(PUBLICATIONS);
  const exact = data.publications.nodes.find(
    (publication) => publication.name.toLowerCase() === "lorem ipsum",
  );
  if (exact) return exact;
  return (
    data.publications.nodes.find((publication) =>
      /headless|hydrogen|storefront/i.test(publication.name),
    ) ?? null
  );
}

async function updateProductStatus(productId, status) {
  const data = await admin(PRODUCT_UPDATE, { product: { id: productId, status } });
  const errors = data.productUpdate.userErrors;
  if (errors.length) throw new Error(`update ${productId}: ${JSON.stringify(errors)}`);
}

async function unpublishResource(id, publicationId) {
  const data = await admin(PUBLISHABLE_UNPUBLISH, {
    id,
    input: [{ publicationId }],
  });
  const errors = data.publishableUnpublish.userErrors;
  if (errors.length) throw new Error(`unpublish ${id}: ${JSON.stringify(errors)}`);
}

async function publishResource(id, publicationId) {
  const data = await admin(PUBLISHABLE_PUBLISH, {
    id,
    input: [{ publicationId }],
  });
  const errors = data.publishablePublish.userErrors;
  if (errors.length) throw new Error(`publish ${id}: ${JSON.stringify(errors)}`);
}

async function collectionMembership() {
  const data = await admin(COLLECTION_BY_HANDLE, { query: `handle:new-in` });
  const collection = data.collections.nodes.find((node) => node.handle === "new-in");
  if (!collection) throw new Error("New In collection not found");
  return collection;
}

async function main() {
  const startedAt = new Date().toISOString();
  const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
  let selected = fixture.products;
  if (onlyHandles) selected = selected.filter((product) => onlyHandles.has(product.handle));
  if (limit) selected = selected.slice(0, limit);
  if (selected.length === 0) throw new Error("No products selected.");

  const report = {
    collections: { failed: [], published: [], missing: [] },
    dryRun,
    errors: [],
    finishedAt: null,
    newIn: { added: [], alreadyPresent: [], published: false, removed: [] },
    products: {
      active: [],
      alreadyActive: [],
      alreadyPublished: [],
      blocked: [],
      demoted: [],
      published: [],
    },
    publication: null,
    startedAt,
    verifyOnly,
  };

  if (dryRun || verifyOnly) {
    console.log(dryRun ? "dry run: no Shopify writes" : "verify only: no Shopify writes");
  }

  const publication = await getPublication();
  if (!publication) throw new Error("No Headless publication found.");
  report.publication = publication;
  console.log(`publication: ${publication.name} (${publication.id})`);

  const allProducts = await fetchProducts();
  const allCollections = await fetchCollections();
  const productsByHandle = new Map(allProducts.map((product) => [product.handle, product]));
  const collectionsByHandle = new Map(
    allCollections.map((collection) => [collection.handle, collection]),
  );

  for (const fixtureProduct of selected) {
    const product = productsByHandle.get(fixtureProduct.handle);
    if (!product) {
      report.errors.push({ handle: fixtureProduct.handle, error: "product not found" });
      continue;
    }
    const blockers = publishBlockers(product, fixtureProduct);
    if (blockers.length > 0) {
      report.products.blocked.push({ handle: product.handle, reasons: blockers });
      if (
        demoteBlocked &&
        !dryRun &&
        !verifyOnly &&
        !skipProducts &&
        (product.status === "ACTIVE" || isPublishedTo(product, publication.id))
      ) {
        try {
          if (product.status === "ACTIVE") await updateProductStatus(product.id, "DRAFT");
          if (isPublishedTo(product, publication.id)) {
            await unpublishResource(product.id, publication.id);
          }
          report.products.demoted.push(product.handle);
        } catch (error) {
          report.errors.push({ error: error.message, handle: product.handle, scope: "demote" });
        }
      }
      await sleep(200);
      continue;
    }
    if (product.status === "ACTIVE") report.products.alreadyActive.push(product.handle);
    else report.products.active.push(product.handle);
    if (isPublishedTo(product, publication.id))
      report.products.alreadyPublished.push(product.handle);
    else report.products.published.push(product.handle);

    if (dryRun || verifyOnly || skipProducts) continue;
    try {
      if (product.status !== "ACTIVE") await updateProductStatus(product.id, "ACTIVE");
      if (!isPublishedTo(product, publication.id)) {
        await publishResource(product.id, publication.id);
      }
    } catch (error) {
      report.errors.push({ error: error.message, handle: product.handle });
    }
    await sleep(200);
  }

  if (!skipCollections) {
    for (const fixtureCollection of fixture.collections) {
      const collection = collectionsByHandle.get(fixtureCollection.handle);
      if (!collection) {
        report.collections.missing.push(fixtureCollection.handle);
        continue;
      }
      report.collections.published.push(collection.handle);
      if (dryRun || verifyOnly) continue;
      try {
        if (!isPublishedTo(collection, publication.id)) {
          await publishResource(collection.id, publication.id);
        }
      } catch (error) {
        report.collections.failed.push({ error: error.message, handle: collection.handle });
      }
      await sleep(150);
    }
  }

  const newIn = collectionsByHandle.get("new-in");
  if (!newIn) {
    report.errors.push({ error: "New In collection not found" });
  } else {
    const eligibleProducts = selected
      .map((fixtureProduct) => ({
        fixtureProduct,
        product: productsByHandle.get(fixtureProduct.handle),
      }))
      .filter(
        ({ fixtureProduct, product }) =>
          product && publishBlockers(product, fixtureProduct).length === 0,
      )
      .map(({ product }) => product);
    const eligibleIds = eligibleProducts.map((product) => product.id);
    const handleById = new Map(eligibleProducts.map((product) => [product.id, product.handle]));
    const desired = new Set(eligibleIds);
    const collection = await collectionMembership();
    const source = collection.sources.find(
      (entry) =>
        entry.__typename === "CollectionConditionsSource" && entry.targetType === "PRODUCTS",
    );
    if (!source) throw new Error("New In has no product source to update.");
    const current = new Map(
      source.inclusion.selections.nodes.map((selection) => [
        selection.product.id,
        selection.product.handle,
      ]),
    );
    const currentIds = new Set(current.keys());
    const missing = eligibleIds.filter((id) => !currentIds.has(id));
    const extra = replaceNewIn ? [...current.keys()].filter((id) => !desired.has(id)) : [];

    report.newIn.added = missing.map((id) => handleById.get(id) ?? id);
    report.newIn.alreadyPresent = eligibleIds.filter((id) => currentIds.has(id));
    report.newIn.removed = extra.map((id) => current.get(id) ?? id);
    report.newIn.desired = eligibleIds.length;

    if (!dryRun && !verifyOnly) {
      try {
        if (missing.length > 0 || extra.length > 0) {
          const inclusion = {};
          if (extra.length > 0) {
            inclusion.selectionsToRemove = extra.map((productId) => ({ productId }));
          }
          if (missing.length > 0) {
            inclusion.selectionsToAdd = missing.map((productId) => ({ productId }));
          }
          const data = await admin(COLLECTION_UPDATE, {
            collection: {
              id: newIn.id,
              sourcesToUpdate: [{ condition: { id: source.id, inclusion } }],
            },
          });
          const errors = data.collectionUpdate.userErrors;
          if (errors.length) throw new Error(JSON.stringify(errors));
        }
        if (!isPublishedTo(newIn, publication.id)) {
          await publishResource(newIn.id, publication.id);
        }
        report.newIn.published = true;
      } catch (error) {
        report.errors.push({ error: error.message, scope: "new-in" });
      }
    }
  }

  report.finishedAt = new Date().toISOString();
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(
    `products: ${report.products.active.length} to activate, ${report.products.published.length} to publish, ` +
      `${report.products.alreadyActive.length} already active, ${report.products.alreadyPublished.length} already published, ` +
      `${report.products.blocked.length} blocked, ${report.products.demoted.length} demoted`,
  );
  if (report.products.blocked.length > 0) {
    for (const blocked of report.products.blocked) {
      console.log(`  blocked ${blocked.handle}: ${blocked.reasons.join(", ")}`);
    }
  }
  console.log(
    `collections: ${report.collections.published.length} publishable, ` +
      `${report.collections.missing.length} missing, ${report.collections.failed.length} failed`,
  );
  console.log(
    `new-in: ${report.newIn.added.length} to add, ${report.newIn.removed.length} to remove, ` +
      `${report.newIn.alreadyPresent.length} already present`,
  );
  console.log(`wrote ${reportPath}`);
  if (report.errors.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
