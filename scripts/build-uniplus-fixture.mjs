#!/usr/bin/env node
/**
 * Builds scripts/data/uniplus-catalog.json from the UniPlus workbook, the local
 * photoshoot folder, and labels_mapping.csv.
 *
 * The workbook's image columns hold Google Drive links. They are not downloadable,
 * so each Drive file is matched to the labelled local file by the UIDs cited in
 * match_notes and by the labelled filename. The committed fixture stores the UID
 * and local filename, never the Drive URL.
 *
 * Run:
 *   node scripts/build-uniplus-fixture.mjs
 *   node scripts/build-uniplus-fixture.mjs --workbook=/path/to/UniPlus_Product_Catalog.xlsx \
 *     --image-dir="/path/to/Lorum Ipsum resources"
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

const args = parseArgs(process.argv.slice(2));
const workbookPath =
  typeof args.workbook === "string"
    ? args.workbook
    : join(homedir(), "workspace", "UniPlus_Product_Catalog.xlsx");
const imageDir =
  typeof args["image-dir"] === "string"
    ? args["image-dir"]
    : join(homedir(), "UniPlus", "Lorum Ipsum resources");
const outputPath = join(dirname(fileURLToPath(import.meta.url)), "data", "uniplus-catalog.json");

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
const VIEW_ORDER = ["front", "back", "detail", "styled"];
const IMAGE_COLUMNS = {
  back: "AL",
  detail: "AM",
  front: "AK",
  styled: "AN",
};

const COLLECTION_TITLES = {
  bralettes: "Bralettes",
  bodysuits: "Bodysuits",
  bottoms: "Bottoms",
  dresses: "Dresses",
  jackets: "Jackets",
  menswear: "Menswear",
  "racer backs": "Racer Backs",
  shirts: "Shirts",
  shorts: "Shorts",
  skirts: "Skirts",
  tops: "Tops",
  tshirts: "T-Shirts",
  womenswear: "Womenswear",
};

const DRIVE_ID_TO_UID = {
  "11wHu-DSf5W5iuAHQyxzHrqqtR_WHSgD8": "U14",
  "121apiCld8T2mBKQhHD3LNaNgBSkaz2Jv": "U08",
  "14aS6m2-q49Hs_8XiVxaKusoNVk1NzEsi": "U33",
  "16u4eks7kcMP6Ec7MuoSqyoIfQf-COOLf": "U36",
  "17iSlQAgslLbJMG7YGQdvEF54wpHMRf6O": "U46",
  "18PPartGPyH8If-w7SRC4bBU78Rr5P9Zh": "U15",
  "18YDnb8mYz3J_x0Vnvchj4qOAyutPboUy": "U58",
  "18YmgyNTI9__86r9jhNE-745Ro08neU7J": "U71",
  "19FzcvCL6UiOnrSu4OiUqpHNlo2su23VV": "U67",
  "19G5Jp3K1HEYDQpFCoLuUIuayN02-bSyc": "U19",
  "1AHD4N6Lg5YkYocuNG0wDPlWwHW44pz0h": "U79",
  "1B0ryUNBzrZ3sf_iYZRfPoCJNy_yjE0OL": "U07",
  "1DWqpm-uvXbTXzU5c7RpsI3ap_LKPnJ5K": "U65",
  "1EDnJJo0pxM9Cn3qx3_uHSR5aSSDBr7Gc": "U18",
  "1Ed-EYRf05PyNlKIr6J5UkCeomcuPNYa-": "U28",
  "1F4TjNxx3VcnMf4EyxJ54qofGOyM3_VEg": "U20",
  "1Gl99GFYbwiWT2MgfjszB1EBRq3OD-fUR": "U53",
  "1J_MwtcQaHijQxy9e11zOvS5wPgrzfjlp": "U40",
  "1KJz5H59ANqCnVIIrAz_ji9B7QRwlZYVa": "U70",
  "1KVKR1tyyUdjIhEYs6Se8uQr4p79F1VjT": "U57",
  "1LB-Pvfn9D7H_-fqnsixkXsnWHH4nCz1N": "U49",
  "1MG4OS51luf_nxzgo0Fj6Apft3kOBqyDD": "U42",
  "1MpoMQ-HydYuRz6dqIoZnw2KIgtbcy-rs": "U09",
  "1MwbGD4K6PHnZ2mT5V85icBLwY8hspAMe": "U06",
  "1NSFNUJQ7_s5OTGCwwjdMm2aIyj4qnl3c": "U55",
  "1O8rZjXnWMihqdyIbTwemuHgzTPpfmrQD": "U12",
  "1PRr-OgfRbDigzgQhNkOKkOO2gHOXlZz7": "U60",
  "1RF3jbM-N020lrDo9C6n64g5Qp7g2TGaO": "U17",
  "1R8IFOVAciQNfei5-hii1T_yhJtaqCokX": "U16",
  "1S0RIioU1ZYIHz1lwFzkKXk4qjWkhCiUA": "U47",
  "1S8dfJTRj4_SQcvs1iLHpJmrqD0if-1fs": "U62",
  "1SqAb0FFCKpJuqllQgLlR9O0Kf21EJTGs": "U29",
  "1SvGJGgSBYbFQsv4PVfgBJtBCWDHjqbYE": "U59",
  "1TtkVU2P43qaTvBLbf961_arjsULpoeYL": "U56",
  "1VOiujwuw1FEglzaPTf6pb75POb7IFama": "U39",
  "1Y3LgGI-72CXkbPuSyxbD395KvLbmXu_m": "U63",
  "1YIgWl8BOctDqad2mrnlmsazh5eD7ebAa": "U52",
  "1bHZo0gSyI3uRv2PchowIPLiPHArC8Awb": "U31",
  "1d2yXSM9u8JmvZg6BsrDMsylRWkOt0xCY": "U11",
  "1dF_gOEiSv5IQCNmHlXUQ8TrYb9k6no2Z": "U13",
  "1dU22u5w5DiAQPIcqsJiwhzmGXGd5NALW": "U05",
  "1fXlNsk3ZdBLZzE6TOKBszRqxZsFBNLsU": "U10",
  "1fajVZPTrogK6KKQpp8qly76S7RvHARHP": "U35",
  "1fqV-oXvIUGRjVvRAMk4bHZiLXNY-iMjd": "U37",
  "1gx8GQDLM4zM8g_b4VAHl5d1ctdB1mfMw": "U64",
  "1k9NNGrNeRB-oQfYox4MquP8H2BMR-47_": "U32",
  "1kG5Kh7OjrjIgzTU27mdTZ39qZWe80-Jr": "U22",
  "1llilDDcdF6XhYRq_QijnNFTQNuPH_Tqg": "U73",
  "1lnR-WscyY01MHlVBZjUA-Whe-UOqirQX": "U48",
  "1lhsI7BgurSP9SjJi2XCPXzAKavdLy7p2": "U21",
  "1mie0_5ac6pOYGh3YgIZ5tlZk-CUY-I7G": "U78",
  "1nhQJsJ3cHN3BZ1uvxV6VNAmz4CjJ2mAa": "U25",
  "1ocQOcPTIBgnGK1W8kjLIcOFKh0rdm1cg": "U23",
  "1pwydK3Z4QVL6xND3yh_WS5c3Kgw_KNqc": "U54",
  "1qIuO0JzH_qKnSK1tcxtz7hectkftlflG": "U04",
  "1qYXha6_eg9bzWo9qI96vVNEBUYTdFUXZ": "U26",
  "1qvmPsj0cAHaooQ2xps0JLRWgbNzYpF5L": "U43",
  "1sMVISi8la_KKZH5KhAnOEioZRjwadE5x": "U75",
  "1tZRF3C8I3kce-bxL4SYyytH3zxMXGyhs": "U66",
  "1u7eVsgdEZsAixL_DF25S3xy5LzDzlMhe": "U34",
  "1uY056Bf35VmXKFQ6LmkoxmX30BK458kG": "U38",
  "1v2SnJ3ud6J1gBNkA2PCaZR1_89fW7chI": "U68",
  "1w_t1Xvv7i-5LCz40-wipcBj_9gbRfmRk": "U50",
  "1xM7wjKRmXE9Gp1uGI_JAX1sQrF_VgRN-": "U61",
  "1xmOQqm_YSVCJgnr2ZbEQ0ahl8BRQGIlw": "U51",
  "1yBUoqHF9HxPjJhh3Dk6nSb95hyMjKm-e": "U30",
  "1yPAkYwux__sE5Tt6HsqGXX5o6rbKqbvM": "U77",
  "1zN9ZnZ7V_PhSchtak_R_BNRszGT0sQXB": "U27",
  "1zStHQYABZwr83_vEb1u_XoudrKVkk-DO": "U76",
  "1zjaArT91CFziSu32wfoLcCemlc_VioH8": "U24",
};

const INFERRED_UIDS = new Set(["U27", "U29", "U31", "U67"]);

function parseArgs(argv) {
  const parsed = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [key, ...rest] = arg.slice(2).split("=");
    parsed[key] = rest.length > 0 ? rest.join("=") : true;
  }
  return parsed;
}

function decodeXml(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function readZipEntries(buffer) {
  let eocd = -1;
  for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      eocd = offset;
      break;
    }
  }
  if (eocd === -1) throw new Error("Workbook is not a readable ZIP archive.");

  const entryCount = buffer.readUInt16LE(eocd + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocd + 16);
  const entries = new Map();
  let cursor = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) {
      throw new Error("Malformed ZIP central directory.");
    }
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localHeaderOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.toString("utf8", cursor + 46, cursor + 46 + nameLength);

    const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataOffset, dataOffset + compressedSize);
    const data = method === 0 ? compressed : inflateRawSync(compressed);
    entries.set(name, data);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function parseWorksheet(xml) {
  const rows = [];
  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = {};
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attributes = cellMatch[1];
      const body = cellMatch[2];
      const reference = attributes.match(/\br="([A-Z]+)\d+"/)?.[1];
      if (!reference) continue;
      const type = attributes.match(/\bt="([^"]+)"/)?.[1];
      let value = "";
      if (type === "inlineStr") {
        value = [...body.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
          .map((match) => decodeXml(match[1]))
          .join("");
      } else {
        const raw = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
        value = raw ? decodeXml(raw) : "";
      }
      row[reference] = value;
    }
    rows.push(row);
  }
  return rows;
}

function readWorkbook(path) {
  if (!existsSync(path)) throw new Error(`Workbook not found: ${path}`);
  const entries = readZipEntries(readFileSync(path));
  const workbook = entries.get("xl/workbook.xml")?.toString("utf8");
  if (!workbook) throw new Error("Workbook has no xl/workbook.xml.");
  const sheets = [...workbook.matchAll(/<sheet\b[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)].map(
    (match) => ({ name: decodeXml(match[1]), relationshipId: match[2] }),
  );
  const relationships = entries.get("xl/_rels/workbook.xml.rels")?.toString("utf8") ?? "";
  const targets = new Map();
  for (const match of relationships.matchAll(/<Relationship\b([^>]*)\/?>/g)) {
    const attributes = match[1];
    const id = attributes.match(/\bId="([^"]+)"/)?.[1];
    const target = attributes.match(/\bTarget="([^"]+)"/)?.[1];
    if (id && target) targets.set(id, decodeXml(target));
  }
  const result = {};
  for (const sheet of sheets) {
    const target = targets.get(sheet.relationshipId);
    if (!target) continue;
    const sheetPath = target.startsWith("/") ? target.slice(1) : `xl/${target}`;
    const xml = entries.get(sheetPath)?.toString("utf8");
    if (xml) result[sheet.name] = parseWorksheet(xml);
  }
  return result;
}

function clean(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nullable(value) {
  const normalized = clean(value);
  return normalized || null;
}

function splitList(value) {
  return clean(value)
    .split(",")
    .map((item) => clean(item))
    .filter(Boolean);
}

function slug(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function skuPart(value) {
  return clean(value)
    .toUpperCase()
    .replace(/&/g, " AND ")
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readLabels(path) {
  const text = readFileSync(path, "utf8");
  const lines = text.trim().split(/\r?\n/);
  const rows = lines.slice(1).map((line) => {
    const [originalName, newName, uid] = line.split(",");
    return { newName: clean(newName), originalName: clean(originalName), uid: clean(uid) };
  });
  const byUid = new Map();
  for (const row of rows) {
    if (!byUid.has(row.uid)) byUid.set(row.uid, []);
    byUid.get(row.uid).push(row);
  }
  const localFileByUid = new Map();
  for (const [uid, matches] of byUid) {
    const preferred = matches.find((match) => !/_copy/i.test(match.newName)) ?? matches[0];
    localFileByUid.set(uid, preferred.newName);
  }
  return { byUid, localFileByUid, rows };
}

function driveId(value) {
  return value.match(/\/d\/([^/]+)/)?.[1] ?? null;
}

function uniqueValues(rows, column) {
  return [...new Set(rows.map((row) => clean(row[column])).filter(Boolean))];
}

function consistentValue(rows, column) {
  const values = uniqueValues(rows, column);
  return values.length === 1 ? values[0] : values.length === 0 ? null : null;
}

function buildProduct(handle, rows, labels, photosDir) {
  const first = rows[0];
  const colourMap = new Map();
  for (const row of rows) {
    const colour = clean(row.I);
    if (!colourMap.has(colour)) colourMap.set(colour, []);
    colourMap.get(colour).push(row);
  }

  const colourways = [];
  const imagesByUid = new Map();
  const imageCells = [];

  for (const [colour, colourRows] of colourMap) {
    const colourFirst = colourRows[0];
    const colourImages = [];
    for (const view of VIEW_ORDER) {
      const column = IMAGE_COLUMNS[view];
      const url = clean(colourFirst[column]);
      if (!url) continue;
      const id = driveId(url);
      const uid = id ? DRIVE_ID_TO_UID[id] : null;
      if (!id) {
        imageCells.push({ colour, issue: "unreadable_drive_url", view });
        continue;
      }
      if (!uid) {
        imageCells.push({ colour, driveId: id, issue: "unmapped_drive_id", view });
        continue;
      }
      const localFile = labels.localFileByUid.get(uid) ?? null;
      const resolved = Boolean(localFile && existsSync(join(photosDir, localFile)));
      const key = uid;
      if (!imagesByUid.has(key)) {
        imagesByUid.set(key, {
          alt: nullable(colourFirst.AO),
          colours: [],
          localFile,
          resolved,
          uid,
          uidInferred: INFERRED_UIDS.has(uid),
          view,
        });
      }
      const image = imagesByUid.get(key);
      if (!image.colours.includes(colour)) image.colours.push(colour);
      if (!colourImages.includes(uid)) colourImages.push(uid);
      if (!resolved) {
        imageCells.push({ colour, issue: "missing_local_file", localFile, uid, view });
      }
    }

    const variants = colourRows
      .map((row) => {
        const size = clean(row.L);
        const sourceSku = nullable(row.N);
        const generatedSku = `UNI-${skuPart(handle)}-${skuPart(colour)}-${skuPart(size)}`;
        return {
          barcode: nullable(row.O),
          colour,
          colourFamily: clean(row.J) || null,
          colourHex: nullable(row.K),
          compareAtPrice: nullable(row.Q),
          continueSelling: clean(row.S).toLowerCase() === "yes",
          countryOfOrigin: nullable(row.W),
          dimensions: nullable(row.U),
          generatedSku,
          hsCode: nullable(row.V),
          inventory: nullable(row.R),
          price: nullable(row.P),
          size,
          sku: sourceSku ?? generatedSku,
          skuGenerated: !sourceSku,
          sourceSku,
          weight: nullable(row.T),
        };
      })
      .sort((left, right) => SIZE_ORDER.indexOf(left.size) - SIZE_ORDER.indexOf(right.size));

    colourways.push({
      family: clean(colourFirst.J) || null,
      hex: nullable(colourFirst.K),
      images: colourImages,
      matchConfidence: clean(colourFirst.AS) || null,
      matchNotes: uniqueValues(colourRows, "AV"),
      name: colour,
      readiness: colourImages.length === 0 ? "blocked" : "partial",
      sourceNames: uniqueValues(colourRows, "AU"),
      sourceQuantity: nullable(colourFirst.AT),
      variants,
    });
  }

  const images = [...imagesByUid.values()].sort((left, right) => {
    const leftColour = colourMap.keys();
    const leftIndex = [...leftColour].indexOf(left.colours[0]);
    const rightIndex = [...colourMap.keys()].indexOf(right.colours[0]);
    if (leftIndex !== rightIndex) return leftIndex - rightIndex;
    return VIEW_ORDER.indexOf(left.view) - VIEW_ORDER.indexOf(right.view);
  });

  const variants = colourways.flatMap((colourway) => colourway.variants);
  const missingImageColours = colourways.filter((colourway) => colourway.images.length === 0);
  const thinImageColours = colourways.filter(
    (colourway) => colourway.images.length > 0 && colourway.images.length < 3,
  );
  const missingFrontColours = colourways.filter((colourway) => {
    if (colourway.images.length === 0) return false;
    const firstImage = images.find((image) => image.uid === colourway.images[0]);
    return firstImage?.view !== "front";
  });
  const unmatchedColours = colourways.filter(
    (colourway) => colourway.matchConfidence === "unmatched",
  );

  const launchBlockers = [];
  if (variants.every((variant) => variant.price == null)) launchBlockers.push("price");
  if (variants.every((variant) => variant.skuGenerated)) launchBlockers.push("sku_confirmation");
  if (variants.every((variant) => variant.inventory == null)) launchBlockers.push("inventory");
  if (!consistentValue(rows, "X")) launchBlockers.push("composition");
  if (!consistentValue(rows, "AA")) launchBlockers.push("care");
  if (!consistentValue(rows, "AC")) launchBlockers.push("fit");
  if (!consistentValue(rows, "W")) launchBlockers.push("country_of_origin");
  if (colourways.every((colourway) => !colourway.hex)) launchBlockers.push("colour_hex");
  if (missingImageColours.length > 0) launchBlockers.push("images_missing_colour");
  if (thinImageColours.length > 0) launchBlockers.push("images_below_minimum");
  if (missingFrontColours.length > 0) launchBlockers.push("images_missing_front");
  if (unmatchedColours.length > 0) launchBlockers.push("colour_unmatched");

  const recommendedGaps = [];
  if (variants.every((variant) => variant.barcode == null)) recommendedGaps.push("barcode");
  if (variants.every((variant) => variant.weight == null)) recommendedGaps.push("weight");
  if (variants.every((variant) => variant.dimensions == null)) recommendedGaps.push("dimensions");
  if (variants.every((variant) => variant.hsCode == null)) recommendedGaps.push("hs_code");
  if (!consistentValue(rows, "AD")) recommendedGaps.push("model_height");
  if (!consistentValue(rows, "AE")) recommendedGaps.push("model_size");
  if (!consistentValue(rows, "AF")) recommendedGaps.push("garment_measurements");
  if (!consistentValue(rows, "Y")) recommendedGaps.push("lining");
  if (!consistentValue(rows, "Z")) recommendedGaps.push("trims");
  if (!consistentValue(rows, "AB")) recommendedGaps.push("care_warnings");
  recommendedGaps.push("manufacturer_importer");

  const productBlockers = launchBlockers.filter(
    (blocker) =>
      ![
        "price",
        "sku_confirmation",
        "inventory",
        "composition",
        "care",
        "fit",
        "colour_hex",
      ].includes(blocker),
  );
  const verdict = images.length === 0 ? "blocked" : "partial";

  return {
    badges: nullable(first.AQ),
    care: nullable(first.AA),
    careWarnings: nullable(first.AB),
    collections: splitList(first.E),
    colourways,
    completeTheLook: splitList(first.AP),
    composition: nullable(first.X),
    countryOfOrigin: nullable(first.W),
    descriptionHtml: nullable(first.AI) ? `<p>${escapeHtml(clean(first.AI))}</p>` : null,
    dimensions: nullable(first.U),
    fit: nullable(first.AC),
    garmentMeasurements: nullable(first.AF),
    handle,
    hsCode: nullable(first.V),
    imageCount: images.length,
    images,
    lining: nullable(first.Y),
    longDescription: nullable(first.AI),
    matchNotes: uniqueValues(rows, "AV"),
    modelHeight: nullable(first.AD),
    modelSize: nullable(first.AE),
    preorderDate: nullable(first.AR),
    productType: nullable(first.C),
    readiness: {
      draftReady: true,
      launchBlockers,
      launchReady: launchBlockers.length === 0,
      missing: productBlockers,
      recommendedGaps,
      verdict,
    },
    seo: {
      description: nullable(first.H),
      title: nullable(first.G),
    },
    shortDescription: nullable(first.AH),
    sizeChartCategory: nullable(first.AG),
    sourceNames: uniqueValues(rows, "AU"),
    status: "DRAFT",
    stylingNotes: nullable(first.AJ),
    tags: splitList(first.F),
    title: clean(first.B),
    trims: nullable(first.Z),
    variants,
    vendor: nullable(first.D),
    weight: nullable(first.T),
  };
}

function main() {
  const labelPath = join(imageDir, "labels_mapping.csv");
  if (!existsSync(labelPath)) throw new Error(`labels_mapping.csv not found: ${labelPath}`);
  const labels = readLabels(labelPath);
  const workbookBytes = readFileSync(workbookPath);
  const workbook = readWorkbook(workbookPath);
  const catalogRows = workbook.Catalog;
  if (!catalogRows?.length) throw new Error("Workbook has no Catalog sheet.");

  const header = catalogRows[0];
  const rows = catalogRows.slice(1).filter((row) => clean(row.A));
  const groups = new Map();
  for (const row of rows) {
    const handle = clean(row.A);
    if (!groups.has(handle)) groups.set(handle, []);
    groups.get(handle).push(row);
  }

  const products = [];
  const driveIds = new Set();
  for (const [handle, productRows] of groups) {
    for (const row of productRows) {
      for (const column of Object.values(IMAGE_COLUMNS)) {
        const id = driveId(clean(row[column]));
        if (id) driveIds.add(id);
      }
    }
    products.push(buildProduct(handle, productRows, labels, imageDir));
  }

  const unmappedDriveIds = [...driveIds].filter((id) => !DRIVE_ID_TO_UID[id]);
  if (unmappedDriveIds.length > 0) {
    throw new Error(`Unmapped Drive ids: ${unmappedDriveIds.join(", ")}`);
  }
  const unusedMappings = Object.keys(DRIVE_ID_TO_UID).filter((id) => !driveIds.has(id));
  if (unusedMappings.length > 0) {
    throw new Error(`Mappings for unused Drive ids: ${unusedMappings.join(", ")}`);
  }

  const allHandles = new Set(products.map((product) => product.handle));
  for (const product of products) {
    for (const handle of product.completeTheLook) {
      if (!allHandles.has(handle)) {
        throw new Error(`${product.handle}: complete_the_look references unknown ${handle}`);
      }
    }
    for (const colourway of product.colourways) {
      if (colourway.variants.length !== SIZE_ORDER.length) {
        throw new Error(
          `${product.handle}/${colourway.name}: expected ${SIZE_ORDER.length} variants, found ${colourway.variants.length}`,
        );
      }
    }
  }

  const collectionHandles = [...new Set(products.flatMap((product) => product.collections))].sort();
  const collections = collectionHandles.map((handle) => ({
    handle: slug(handle),
    sourceName: handle,
    title: COLLECTION_TITLES[handle] ?? handle.replace(/\b\w/g, (letter) => letter.toUpperCase()),
  }));

  const allColourways = products.flatMap((product) => product.colourways);
  const images = products.flatMap((product) => product.images);
  const uniqueLocalImages = new Set(images.map((image) => image.uid)).size;
  const summary = {
    colourways: allColourways.length,
    colourwaysWithImages: allColourways.filter((colourway) => colourway.images.length > 0).length,
    colourwaysWithThreeImages: allColourways.filter((colourway) => colourway.images.length >= 3)
      .length,
    colourwaysWithoutImages: allColourways.filter((colourway) => colourway.images.length === 0)
      .length,
    collections: collections.length,
    generatedSkus: products
      .flatMap((product) => product.variants)
      .filter((variant) => variant.skuGenerated).length,
    imageCells: products.reduce(
      (total, product) =>
        total + product.colourways.reduce((count, colourway) => count + colourway.images.length, 0),
      0,
    ),
    images: images.length,
    products: products.length,
    productsBlocked: products.filter((product) => product.readiness.verdict === "blocked").length,
    productsPartial: products.filter((product) => product.readiness.verdict === "partial").length,
    productsReady: products.filter((product) => product.readiness.verdict === "ready").length,
    productsWithImages: products.filter((product) => product.imageCount > 0).length,
    productsWithoutImages: products.filter((product) => product.imageCount === 0).length,
    sizes: SIZE_ORDER,
    uniqueLocalImages,
    variants: products.reduce((total, product) => total + product.variants.length, 0),
  };

  if (summary.products !== 39) throw new Error(`Expected 39 products, found ${summary.products}`);
  if (summary.variants !== 354) throw new Error(`Expected 354 variants, found ${summary.variants}`);

  const notes = (workbook.Notes ?? [])
    .map((row) => {
      const values = Object.values(row).map(clean).filter(Boolean);
      return values.length >= 2 ? { label: values[0], text: values.slice(1).join(" ") } : null;
    })
    .filter(Boolean);

  const fixture = {
    collections,
    products,
    source: {
      catalogRows: rows.length,
      generatedBy: "scripts/build-uniplus-fixture.mjs",
      imageFolder: basename(imageDir),
      labelsMapping: "labels_mapping.csv",
      labelsMappingSha256: createHash("sha256").update(readFileSync(labelPath)).digest("hex"),
      notes,
      sheet: "Catalog",
      sizeOrder: SIZE_ORDER,
      workbook: basename(workbookPath),
      workbookSha256: createHash("sha256").update(workbookBytes).digest("hex"),
    },
    summary,
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(fixture, null, 2)}\n`);
  const formatter = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "node_modules",
    ".bin",
    "oxfmt",
  );
  if (existsSync(formatter)) execFileSync(formatter, [outputPath], { stdio: "ignore" });
  console.log(`wrote ${outputPath}`);
  console.log(JSON.stringify(summary, null, 2));
  console.log(`header columns: ${Object.keys(header).length}`);
  console.log(`labels: ${labels.rows.length} rows, ${labels.byUid.size} UIDs`);
  console.log(
    `unused local UIDs: ${[...labels.byUid.keys()].filter((uid) => !products.some((product) => product.images.some((image) => image.uid === uid))).join(", ")}`,
  );
}

main();
