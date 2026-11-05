#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TOKENS = JSON.parse(readFileSync(join(ROOT, "design/tokens.manifest.json"), "utf8"));
const BASELINE = JSON.parse(readFileSync(join(ROOT, "design/drift-baseline.json"), "utf8"));
const EXCEPTIONS_PATH = join(ROOT, "design/exceptions.json");
const EXCEPTIONS = existsSync(EXCEPTIONS_PATH)
  ? (JSON.parse(readFileSync(EXCEPTIONS_PATH, "utf8")).exceptions ?? [])
  : [];
const NOW = Date.now();
const CSS = readFileSync(join(ROOT, "app/globals.css"), "utf8");

const errors = [];
const warnings = [];
const report = {
  generatedAt: new Date().toISOString(),
  counts: {},
  exceptionsUsed: [],
  violations: [],
};

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function assertToken(name, value, section) {
  const pattern = new RegExp(
    `${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")};`,
  );
  if (!pattern.test(CSS)) fail(`${section}: ${name} must be ${value}`);
}

for (const [name, value] of Object.entries(TOKENS.colors)) assertToken(name, value, "colour");
for (const [role, token] of Object.entries(TOKENS.type)) {
  assertToken(`--text-${role}`, token.size, "type");
  assertToken(`--text-${role}--line-height`, token.lineHeight, "type");
}
for (const [name, value] of Object.entries(TOKENS.spacing.base))
  assertToken(name, value, "spacing");
for (const [name, value] of Object.entries(TOKENS.spacing.desktop)) {
  if (
    !new RegExp(
      `${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")};`,
    ).test(CSS)
  ) {
    fail(`spacing desktop: ${name} must be ${value} inside the desktop media query`);
  }
}
for (const [name, value] of Object.entries(TOKENS.motion)) assertToken(name, value, "motion");
for (const [name, value] of Object.entries(TOKENS.breakpoints))
  assertToken(name, value, "breakpoint");
for (const forbidden of TOKENS.forbid) {
  if (CSS.includes(forbidden)) fail(`globals.css still defines forbidden token ${forbidden}`);
}
if (/--color-shop/.test(CSS)) fail("the Shop accent must not be a storefront token");
if (/--color-positive/.test(CSS)) fail("positive status colour must not be a storefront token");
if (/--text-lg--letter-spacing:\s*-/.test(CSS)) fail("headings must not attach negative tracking");

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".") || entry === "node_modules") continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (/\.(tsx|ts)$/.test(path)) files.push(path);
  }
  return files;
}

const files = [...walk(join(ROOT, "app")), ...walk(join(ROOT, "components"))];
const patterns = [
  { name: "rectangular radius", re: /\brounded-(xs|sm|md|lg|xl|2xl|3xl|4xl)\b/g },
  { name: "template shadow", re: /\bshadow-(xs|sm|md|lg|xl|2xl)\b/g },
  { name: "weight 500+", re: /\bfont-(medium|semibold|bold)\b/g },
  { name: "template heading size", re: /\btext-(2xl|3xl|4xl|5xl|6xl|7xl)\b/g },
  { name: "arbitrary type", re: /\btext-\[[^\]]+\]/g },
  { name: "arbitrary leading", re: /\bleading-\[[^\]]+\]/g },
  { name: "arbitrary radius", re: /\brounded-\[[^\]]+\]/g },
  { name: "dark variant", re: /\bdark:/g },
  { name: "non-system breakpoint", re: /\b(sm|md|lg|xl):(?=[a-z[])/g },
  { name: "legacy type alias", re: /\btext-(3xs|2xs|xxs|13)\b/g },
  { name: "monospace role", re: /\bfont-mono\b/g },
  {
    name: "spectral palette",
    re: /\b(?:bg|text|border)-(?:red|green|amber|blue|emerald|yellow|orange|purple|indigo|violet|pink|rose|sky|cyan|teal|lime|fuchsia)-\d{2,3}\b/g,
  },
  { name: "raw hex in class", re: /\b(?:bg|text|border)-\[#[0-9a-fA-F]{3,8}\]/g },
];

for (const file of files) {
  const rel = relative(ROOT, file);
  const source = readFileSync(file, "utf8");
  source.split("\n").forEach((line, index) => {
    if (line.includes("oxlint-disable")) return;
    for (const { name, re } of patterns) {
      re.lastIndex = 0;
      const match = re.exec(line);
      if (!match) continue;
      report.violations.push({ file: rel, line: index + 1, rule: name, value: match[0] });
    }
  });

  if (rel !== "components/ui/link.tsx" && /from\s+["']next\/link["']/.test(source)) {
    report.violations.push({ file: rel, line: 1, rule: "next/link import", value: "next/link" });
  }
  if (rel.startsWith("components/ui/")) {
    for (const boundary of [
      "@/lib/shopify",
      "@/lib/cart",
      "@/lib/product",
      "@/lib/collections",
      "next/navigation",
      "next/headers",
      "next/cache",
    ]) {
      if (
        new RegExp(`from\\s+["']${boundary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(source)
      ) {
        report.violations.push({ file: rel, line: 1, rule: "ui boundary import", value: boundary });
      }
    }
  }
}

for (const alias of Object.keys(BASELINE.aliases)) {
  const count = files.reduce((sum, file) => {
    const source = readFileSync(file, "utf8");
    return sum + (source.match(new RegExp(`\\b${alias}\\b`, "g"))?.length ?? 0);
  }, 0);
  report.counts[alias] = count;
  if (count > BASELINE.aliases[alias]) {
    fail(
      `alias ${alias} grew from ${BASELINE.aliases[alias]} to ${count}; use the canonical token instead`,
    );
  }
}

function matchingException(violation) {
  return EXCEPTIONS.find(
    (exception) =>
      exception.file === violation.file &&
      exception.rule === violation.rule &&
      (!exception.expires || Date.parse(exception.expires) > NOW),
  );
}

for (const violation of report.violations) {
  const exception = matchingException(violation);
  if (exception) {
    report.exceptionsUsed.push({
      file: violation.file,
      owner: exception.owner,
      reason: exception.reason,
      rule: violation.rule,
    });
    warn(`${violation.file} uses an exception for ${violation.rule}: ${exception.reason}`);
  } else {
    fail(`${violation.file}:${violation.line} ${violation.rule}: ${violation.value}`);
  }
}

for (const exception of EXCEPTIONS) {
  if (exception.expires && Date.parse(exception.expires) <= NOW) {
    fail(`expired design exception for ${exception.file} (${exception.rule}); fix it or renew it`);
  }
}

writeFileSync(join(ROOT, "design/drift-report.json"), JSON.stringify(report, null, 2));

for (const message of warnings) console.warn(`warn  ${message}`);
for (const message of errors) console.error(`error ${message}`);
if (errors.length > 0) {
  console.error(`\nDesign system check failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`Design system check passed across ${files.length} files.`);
