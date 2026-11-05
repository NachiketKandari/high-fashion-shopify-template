#!/usr/bin/env node
/**
 * Seeds a Shopify store with a high-fashion catalog for the Lorem Ipsum storefront template.
 *
 * Requires an Admin app with:
 *   read_products, write_products, read_publications, write_publications, read_files, write_files
 *
 * Authenticate with either a Dev Dashboard app (client ID + secret) or an existing
 * Admin API access token. Dev Dashboard tokens expire after 24 hours, so the script
 * exchanges the credentials on every run.
 *
 * Run:
 *   SHOPIFY_CLIENT_ID=... SHOPIFY_CLIENT_SECRET=... \
 *   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com \
 *   node scripts/seed-catalog.mjs
 *
 * Add UNPUBLISH_OTHERS=1 to unpublish demo products and collections from the Headless channel.
 */

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const version = process.env.SHOPIFY_API_VERSION ?? "2026-10";
const dryRun = process.env.DRY_RUN === "1";
const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

if (!dryRun && (!domain || (!staticToken && !(clientId && clientSecret)))) {
  console.error(
    "Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and either SHOPIFY_ADMIN_ACCESS_TOKEN or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET.",
  );
  process.exit(1);
}

const endpoint = `https://${domain}/admin/api/${version}/graphql.json`;

let accessToken = staticToken;

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
  if (!response.ok)
    throw new Error(`Shopify Admin API ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(JSON.stringify(payload.errors, null, 2));
  return payload.data;
}

// Reference CDN assets for demo only; replace with your own product imagery before publishing.
const image = (path, width = 1600) =>
  `https://politesocietyshop.com/cdn/shop/files/${path}?width=${width}`;

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const PRODUCTS = [
  {
    collections: ["corsets", "tops", "new-in", "core"],
    descriptionHtml:
      "<p>Panelled corset with internal boning and cups. Eyelets and adjustable lacing at the back. Body-fitted silhouette.</p><p>Fabric &amp; Care:<br>- Main: 100% Viscose Satin with Nylon Lace<br>- Lining: Poly Cotton<br>- Care: Dry clean on low heat</p>",
    handle: "alma-lace-corset-top",
    images: ["Polite_Society_June_2026_25075.jpg", "Polite_Society_June_2026_25120.jpg"],
    price: "185.00",
    productType: "Corsets",
    title: "Alma Lace Corset Top",
    variants: [
      { color: "Brown", hex: "#4e3628", image: 0 },
      { color: "Burnt Orange", hex: "#BB5F26", image: 0 },
      { color: "Black", hex: "#111111", image: 0 },
    ],
  },
  {
    collections: ["corsets", "tops", "new-in", "essentials"],
    descriptionHtml:
      "<p>Everyday corset in a soft stretch weave with a shaped hem. Fully lined and finished with a concealed side zip.</p><p>Fabric &amp; Care:<br>- Main: 96% Cotton, 4% Elastane<br>- Care: Machine wash cold</p>",
    handle: "rosa-corset-top",
    images: [
      "430698-1774961952325._063dd208-6787-4cf6-8ff6-882411febfe8.png",
      "430698-1774961947429._1e7ba984-e45c-4ef2-bcf8-f693e0c77936.png",
    ],
    price: "165.00",
    productType: "Corsets",
    title: "Rosa Corset Top",
    variants: [
      { color: "Ink", hex: "#1b2436", image: 0 },
      { color: "Black", hex: "#111111", image: 0 },
    ],
  },
  {
    collections: ["dresses-and-jumpsuits", "new-in", "core"],
    descriptionHtml:
      "<p>Tailored playsuit with a corset waist and shorts cut for movement. Finished with a pointed collar and patch pockets.</p><p>Fabric &amp; Care:<br>- Main: 100% Cotton Poplin<br>- Care: Dry clean</p>",
    handle: "mexi-corset-playsuit",
    images: ["PoliteSocietyJune202626139.jpg", "PoliteSocietyJune202626149.jpg"],
    price: "175.00",
    productType: "Dresses & Jumpsuits",
    title: "Mexi Corset Playsuit",
    variants: [
      { color: "Black", hex: "#111111", image: 0 },
      { color: "Stone", hex: "#c9bfae", image: 0 },
    ],
  },
  {
    collections: ["corsets", "tops", "new-in", "signature"],
    descriptionHtml:
      "<p>Structured corset with a sweetheart neckline and panelled body. Adjustable straps and a concealed back zip.</p><p>Fabric &amp; Care:<br>- Main: 100% Polyester<br>- Care: Dry clean</p>",
    handle: "rati-corset",
    images: [
      "006_0e53a34d-ea0b-44d5-a5d5-e541549d1144.jpg",
      "005_056fab6c-33db-4a86-b3bc-5d64dce2a831.jpg",
    ],
    price: "130.00",
    productType: "Corsets",
    title: "Rati Corset",
    variants: [
      { color: "Wine", hex: "#5c1f26", image: 0 },
      { color: "Black", hex: "#111111", image: 0 },
    ],
  },
  {
    collections: ["corsets", "tops", "new-in", "signature"],
    descriptionHtml:
      "<p>Strapless corset in a printed mesh with a sculpted waist and curved hem. Fully lined.</p><p>Fabric &amp; Care:<br>- Main: 92% Nylon, 8% Elastane<br>- Care: Hand wash cold</p>",
    handle: "solapur-corset",
    images: [
      "Polite_Society_June_2026_25853_ee1d1fff-ecb1-48e4-8824-8332a1a93041.jpg",
      "Polite_Society_June_2026_25851_c301f179-055f-421a-ae32-b7f24b7b42b3.jpg",
    ],
    price: "110.00",
    productType: "Corsets",
    title: "Solapur Corset",
    variants: [
      { color: "Print", hex: "#8e9aa8", image: 0 },
      { color: "Black", hex: "#111111", image: 0 },
    ],
  },
  {
    collections: ["dresses-and-jumpsuits", "new-in", "essentials"],
    descriptionHtml:
      "<p>Floor-length slip dress cut on the bias with adjustable straps and a lace-trimmed hem.</p><p>Fabric &amp; Care:<br>- Main: 100% Viscose<br>- Care: Dry clean</p>",
    handle: "lolita-slip-dress",
    images: ["430686-1774961765790..png", "430686-1774961769438..png"],
    price: "180.00",
    productType: "Dresses & Jumpsuits",
    title: "Lolita Slip Dress",
    variants: [
      { color: "Botanical", hex: "#556b2f", image: 0 },
      { color: "Black", hex: "#111111", image: 0 },
    ],
  },
  {
    collections: ["corsets", "tops", "new-in", "signature"],
    descriptionHtml:
      "<p>Denim corset with a strapless neckline and raw-edge hem. Side zip and internal boning.</p><p>Fabric &amp; Care:<br>- Main: 100% Cotton Denim<br>- Care: Dry clean</p>",
    handle: "gulnar-corset-top",
    images: ["Gulnar_04.jpg", "Gulnar_05.jpg"],
    price: "155.00",
    productType: "Corsets",
    title: "Gulnar Corset Top",
    variants: [
      { color: "Dark Ash", hex: "#55585c", image: 0 },
      { color: "Indigo", hex: "#28324a", image: 0 },
    ],
  },
  {
    collections: ["corsets", "tops", "new-in", "core"],
    descriptionHtml:
      "<p>Sheer lace corset with a sweetheart neckline and adjustable back lacing. Fully lined cups.</p><p>Fabric &amp; Care:<br>- Main: Nylon Lace<br>- Care: Dry clean</p>",
    handle: "lilith-corset",
    images: [
      "PoliteSocietyJune202625772_08310d55-6970-4257-8a86-126ade2a3538.jpg",
      "PoliteSocietyJune202625789_5a1860ca-8a49-48ba-a40c-56dda2067d2e.jpg",
    ],
    price: "165.00",
    productType: "Corsets",
    title: "Lilith Corset",
    variants: [
      { color: "Black", hex: "#111111", image: 0 },
      { color: "Ecru", hex: "#e4ddce", image: 0 },
    ],
  },
  {
    collections: ["tops", "new-in", "essentials"],
    descriptionHtml:
      "<p>Second-skin top with a high neck and clean finish. Cut for a close fit.</p><p>Fabric &amp; Care:<br>- Main: 90% Modal, 10% Elastane<br>- Care: Machine wash cold</p>",
    handle: "naked-knit-top",
    images: ["Blue_Naked_Top_003.jpg", "Blue_Naked_Top_004.jpg"],
    price: "95.00",
    productType: "Tops",
    title: "Naked Knit Top",
    variants: [
      { color: "Blue", hex: "#7d9ed1", image: 0 },
      { color: "Black", hex: "#111111", image: 0 },
    ],
  },
  {
    collections: ["bottoms", "new-in", "core"],
    descriptionHtml:
      "<p>Low-rise draped trousers with a soft fold at the waist and a wide leg.</p><p>Fabric &amp; Care:<br>- Main: 100% Viscose<br>- Care: Dry clean</p>",
    handle: "draped-trousers",
    images: ["430653-1774961335447..png", "430653-1774961341747..png"],
    price: "140.00",
    productType: "Bottoms",
    title: "Draped Trousers",
    variants: [
      { color: "Black", hex: "#111111", image: 0 },
      { color: "Sand", hex: "#c8b79d", image: 0 },
    ],
  },
  {
    collections: ["outerwear", "unisex-1", "new-in", "work-wear"],
    descriptionHtml:
      "<p>Relaxed overshirt cut from striped cotton with a boxy shoulder and metal buttons. Wear it open over a corset or closed as a light layer.</p><p>Fabric &amp; Care:<br>- Main: 100% Cotton<br>- Care: Dry clean</p>",
    handle: "striped-overshirt",
    images: [
      "BACK_CUTOUT_STRIPED_BLAZER_-_Polite_Society-4663448_115067a6-8941-4bd5-a68b-85e6425e8116.jpg",
    ],
    price: "210.00",
    productType: "Outerwear",
    title: "Striped Overshirt",
    variants: [
      { color: "Black Stripe", hex: "#1b1b1b", image: 0 },
      { color: "Ivory", hex: "#efe9dc", image: 0 },
    ],
  },
  {
    collections: ["accessories", "new-in", "evening", "festive"],
    descriptionHtml:
      "<p>Structured bustier belt in smooth leather with a pointed front and an adjustable back strap. Cinch it over shirting or a slip dress.</p><p>Fabric &amp; Care:<br>- Main: 100% Leather<br>- Care: Wipe with a soft dry cloth</p>",
    handle: "bustier-belt",
    images: ["BUSTIER_BELT_-_Polite_Society-4664113_4ae13cb6-086c-41f8-864f-ae7d028180a3.jpg"],
    price: "95.00",
    productType: "Accessories",
    title: "Bustier Belt",
    variants: [
      { color: "Black", hex: "#111111", image: 0 },
      { color: "Brown", hex: "#4e3628", image: 0 },
    ],
  },
];

const COLLECTIONS = [
  { handle: "corsets", title: "Corsets" },
  { handle: "dresses-and-jumpsuits", title: "Dresses & Jumpsuits" },
  { handle: "tops", title: "Tops" },
  { handle: "bottoms", title: "Bottoms" },
  { handle: "new-in", title: "New In" },
  { handle: "core", title: "Core" },
  { handle: "essentials", title: "Essentials" },
  { handle: "signature", title: "Elevated" },
  { handle: "chapter-x", title: "New In" },
  { handle: "women", title: "Woman" },
  { handle: "unisex-1", title: "Unisex" },
  { handle: "bestsellers", title: "Bestsellers" },
  { handle: "co-ord-sets", title: "Co-ord Sets" },
  { handle: "knits", title: "Knitwear" },
  { handle: "bottoms-women", title: "Bottoms" },
  { handle: "bottoms-unisex", title: "Bottoms" },
  { handle: "accessories", title: "Accessories" },
  { handle: "work-wear", title: "Work Wear" },
  { handle: "evening", title: "Evening" },
  { handle: "weekend", title: "Weekend" },
  { handle: "festive", title: "Festive" },
  { handle: "shirts-and-tshirts", title: "Shirts & T-shirts" },
  { handle: "outerwear", title: "Outerwear" },
];

const ALL_PRODUCT_HANDLES = PRODUCTS.map(({ handle }) => handle);

// Collections share the ten seeded products so every live-site navigation target resolves.
const COLLECTION_MEMBERS = {
  accessories: ["bustier-belt"],
  bestsellers: [
    "alma-lace-corset-top",
    "bustier-belt",
    "draped-trousers",
    "gulnar-corset-top",
    "lilith-corset",
    "lolita-slip-dress",
    "mexi-corset-playsuit",
    "naked-knit-top",
    "striped-overshirt",
    "rati-corset",
    "rosa-corset-top",
    "solapur-corset",
  ],
  "bottoms-unisex": ["draped-trousers"],
  "bottoms-women": ["draped-trousers"],
  "chapter-x": ALL_PRODUCT_HANDLES,
  "co-ord-sets": ["draped-trousers", "mexi-corset-playsuit"],
  evening: ["bustier-belt", "lilith-corset", "lolita-slip-dress", "rati-corset", "solapur-corset"],
  festive: ["alma-lace-corset-top", "bustier-belt", "gulnar-corset-top", "lilith-corset"],
  knits: ["naked-knit-top"],
  outerwear: ["striped-overshirt"],
  "shirts-and-tshirts": ["naked-knit-top"],
  "unisex-1": ALL_PRODUCT_HANDLES,
  weekend: ["draped-trousers", "naked-knit-top", "rosa-corset-top"],
  women: ALL_PRODUCT_HANDLES,
  "work-wear": ["draped-trousers", "naked-knit-top", "striped-overshirt"],
};

const PRODUCT_SET = `#graphql
  mutation ProductSet($input: ProductSetInput!, $synchronous: Boolean!) {
    productSet(input: $input, synchronous: $synchronous) {
      product { id handle }
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

const COLLECTION_ADD = `#graphql
  mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
    collectionAddProducts(id: $id, productIds: $productIds) {
      collection { id handle }
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

const PUBLICATIONS = `#graphql
  query {
    publications(first: 20) {
      nodes { id name }
    }
  }
`;

// Products and collections only reach the Storefront API through the Headless publication.
let publicationId;

async function getPublicationId() {
  if (publicationId !== undefined) return publicationId;
  if (process.env.SHOPIFY_PUBLICATION_ID) {
    publicationId = process.env.SHOPIFY_PUBLICATION_ID;
    return publicationId;
  }
  const data = await admin(PUBLICATIONS);
  const nodes = data.publications.nodes;
  const match = nodes.find(({ name }) => /headless|hydrogen|storefront/i.test(name));
  if (!match) {
    console.warn(
      `No Headless publication found; set SHOPIFY_PUBLICATION_ID. Available: ${
        nodes.map(({ name }) => name).join(", ") || "none"
      }`,
    );
    publicationId = null;
    return publicationId;
  }
  console.log(`publishing to ${match.name}`);
  publicationId = match.id;
  return publicationId;
}

async function publish(id) {
  const target = await getPublicationId();
  if (!target) return;
  const data = await admin(PUBLISHABLE_PUBLISH, {
    id,
    input: [{ publicationId: target }],
  });
  const errors = data.publishablePublish.userErrors;
  if (errors.length) throw new Error(`publish ${id}: ${JSON.stringify(errors)}`);
}

async function findProduct(handle) {
  const data = await admin(
    `#graphql
      query FindProduct($query: String!) {
        products(first: 1, query: $query) { nodes { id handle } }
      }`,
    { query: `handle:${handle}` },
  );
  return data.products.nodes[0] ?? null;
}

async function findCollection(handle) {
  const data = await admin(
    `#graphql
      query FindCollection($query: String!) {
        collections(first: 1, query: $query) { nodes { id handle } }
      }`,
    { query: `handle:${handle}` },
  );
  return data.collections.nodes[0] ?? null;
}

function productInput(product) {
  const files = product.images.map((path, index) => {
    const extension = path.split("?")[0].split(".").pop()?.toLowerCase() ?? "jpg";
    return {
      alt: `${product.title} image ${index + 1}`,
      contentType: "IMAGE",
      filename: `${product.handle}-${index + 1}.${extension}`,
      originalSource: image(path),
    };
  });
  const variants = product.variants.flatMap((variant) =>
    sizes.map((size) => ({
      inventoryItem: { sku: `${product.handle}-${variant.color}-${size}`, tracked: false },
      inventoryPolicy: "CONTINUE",
      optionValues: [
        { name: variant.color, optionName: "Colour" },
        { name: size, optionName: "Size" },
      ],
      price: product.price,
    })),
  );
  return {
    descriptionHtml: product.descriptionHtml,
    files,
    handle: product.handle,
    productOptions: [
      { name: "Colour", values: product.variants.map(({ color }) => ({ name: color })) },
      { name: "Size", values: sizes.map((name) => ({ name })) },
    ],
    productType: product.productType,
    status: "ACTIVE",
    tags: product.collections,
    title: product.title,
    variants,
    vendor: "Lorem Ipsum",
  };
}

async function unpublishOthers() {
  const publication = await getPublicationId();
  if (!publication) return;

  const resources = [
    {
      connection: "products",
      keep: new Set([...PRODUCTS.map(({ handle }) => handle), "gift-card"]),
      label: "product",
      query: PUBLISHED_PRODUCTS,
    },
    {
      connection: "collections",
      keep: new Set(COLLECTIONS.map(({ handle }) => handle)),
      label: "collection",
      query: PUBLISHED_COLLECTIONS,
    },
  ];

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
        const result = await admin(PUBLISHABLE_UNPUBLISH, {
          id: node.id,
          input: [{ publicationId: publication }],
        });
        const errors = result.publishableUnpublish.userErrors;
        if (errors.length) throw new Error(`unpublish ${node.handle}: ${JSON.stringify(errors)}`);
        console.log(`unpublished ${resource.label} ${node.handle}`);
      }
      after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
    } while (after);
  }
}

async function main() {
  if (dryRun) {
    console.log(JSON.stringify(productInput(PRODUCTS[0]), null, 2));
    return;
  }

  const idsByHandle = new Map();

  for (const product of PRODUCTS) {
    const existing = await findProduct(product.handle);
    if (existing) {
      console.log(`skip product ${product.handle}`);
      await publish(existing.id);
      idsByHandle.set(product.handle, existing.id);
      continue;
    }
    const data = await admin(PRODUCT_SET, { input: productInput(product), synchronous: true });
    const errors = data.productSet.userErrors;
    if (errors.length) throw new Error(`${product.handle}: ${JSON.stringify(errors)}`);
    await publish(data.productSet.product.id);
    idsByHandle.set(product.handle, data.productSet.product.id);
    console.log(`created product ${product.handle}`);
  }

  const collectionIds = new Map();
  for (const collection of COLLECTIONS) {
    const existing = await findCollection(collection.handle);
    if (existing) {
      console.log(`skip collection ${collection.handle}`);
      await publish(existing.id);
      collectionIds.set(collection.handle, existing.id);
      continue;
    }
    const data = await admin(COLLECTION_CREATE, { input: collection });
    const errors = data.collectionCreate.userErrors;
    if (errors.length) throw new Error(`${collection.handle}: ${JSON.stringify(errors)}`);
    await publish(data.collectionCreate.collection.id);
    collectionIds.set(collection.handle, data.collectionCreate.collection.id);
    console.log(`created collection ${collection.handle}`);
  }

  for (const collection of COLLECTIONS) {
    const handles =
      COLLECTION_MEMBERS[collection.handle] ??
      PRODUCTS.filter((product) => product.collections.includes(collection.handle)).map(
        (product) => product.handle,
      );
    const productIds = handles.map((handle) => idsByHandle.get(handle)).filter(Boolean);
    if (productIds.length === 0) continue;
    const data = await admin(COLLECTION_ADD, {
      id: collectionIds.get(collection.handle),
      productIds,
    });
    const errors = data.collectionAddProducts.userErrors;
    if (errors.length) throw new Error(`${collection.handle}: ${JSON.stringify(errors)}`);
    console.log(`added ${productIds.length} products to ${collection.handle}`);
  }

  if (process.env.UNPUBLISH_OTHERS === "1") await unpublishOthers();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
