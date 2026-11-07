import { writeFile } from "node:fs/promises";

/**
 * Lab harness for the numbers in docs/PERFORMANCE-AUDIT.md.
 *
 * Usage:
 *   BASE_URL=http://localhost:3103 ROUTE=/collections/all PROFILE=desktop ITERATIONS=3 \
 *     OUT=/tmp/run.json node scripts/perf/measure.mjs
 *
 * PROFILE=mobile applies 4x CPU throttling plus 1.6 Mbps / 150 ms RTT; THROTTLE=0 turns the
 * network emulation off. SETTLE_MS (default 6000) is the fixed capture window after load.
 * Run against `pnpm build && PORT=3103 pnpm start`, and restart the server before each route
 * for a cold run.
 */
import { chromium, devices } from "@playwright/test";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3103";
const route = process.env.ROUTE ?? "/";
const label = process.env.LABEL ?? "run";
const profile = process.env.PROFILE ?? "desktop";
const iterations = Number(process.env.ITERATIONS ?? "3");
const outFile = process.env.OUT;
const throttle = process.env.THROTTLE !== "0";

const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const mobile = {
  ...devices["iPhone 13"],
  viewport: { width: 390, height: 844 },
};

const browser = await chromium.launch({ headless: true });
const results = [];

for (let iteration = 0; iteration < iterations; iteration += 1) {
  const context = await browser.newContext(profile === "mobile" ? mobile : desktop);
  const page = await context.newPage();
  const client = await context.newCDPSession(page);

  await client.send("Network.enable");
  await client.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (profile === "mobile" && throttle) {
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      connectionType: "cellular4g",
    });
  }

  const requests = new Map();
  const finished = [];
  client.on("Network.requestWillBeSent", (event) => {
    requests.set(event.requestId, {
      url: event.request.url,
      start: event.timestamp,
      type: event.type,
    });
  });
  client.on("Network.loadingFinished", (event) => {
    const request = requests.get(event.requestId);
    if (!request) return;
    finished.push({
      bytes: event.encodedDataLength,
      durationMs: Math.round((event.timestamp - request.start) * 1000),
      type: request.type,
      url: request.url,
    });
  });

  await page.addInitScript(() => {
    window.perfProbe = { cls: 0, lcp: 0, longTasks: [] };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.perfProbe.lcp = entry.startTime;
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.perfProbe.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.perfProbe.longTasks.push(Math.round(entry.duration));
      }
    }).observe({ type: "longtask", buffered: true });
  });

  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "load", timeout: 120_000 });
  const ttfb = response ? await response.request().timing() : null;

  await page.waitForTimeout(Number(process.env.SETTLE_MS ?? "6000"));

  const nav = await page.evaluate(() => {
    const entry = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    return {
      cls: window.perfProbe.cls,
      dcl: entry.domContentLoadedEventEnd,
      domInteractive: entry.domInteractive,
      fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null,
      lcp: window.perfProbe.lcp,
      load: entry.loadEventEnd,
      longTasks: window.perfProbe.longTasks,
      navigation: {
        dns: entry.domainLookupEnd - entry.domainLookupStart,
        request: entry.responseStart - entry.requestStart,
        response: entry.responseEnd - entry.responseStart,
        ttfb: entry.responseStart,
      },
      resourceCount: resources.length,
      resourceTransferSize: resources.reduce((sum, item) => sum + (item.transferSize ?? 0), 0),
      responseBytes: entry.transferSize ?? 0,
      responseEncodedBytes: entry.encodedBodySize ?? 0,
    };
  });

  const byType = {};
  for (const item of finished) {
    byType[item.type] = byType[item.type] ?? { bytes: 0, requests: 0 };
    byType[item.type].bytes += item.bytes;
    byType[item.type].requests += 1;
  }

  results.push({
    bytes: finished.reduce((sum, item) => sum + item.bytes, 0),
    byType,
    iteration,
    label,
    metrics: nav,
    profile,
    requests: finished.length,
    route,
    serverResponse: ttfb
      ? {
          dns: Math.round(ttfb.domainLookupEnd - ttfb.domainLookupStart),
          request: Math.round(ttfb.requestStart),
          response: Math.round(ttfb.responseStart - ttfb.requestStart),
          ttfb: Math.round(ttfb.responseStart),
        }
      : null,
    slowest: finished
      .slice()
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 10)
      .map((item) => ({
        bytes: item.bytes,
        durationMs: item.durationMs,
        type: item.type,
        url: item.url.replace(baseUrl, ""),
      })),
  });

  await context.close();
}

await browser.close();
const payload = JSON.stringify(results, null, 2);
if (outFile) await writeFile(outFile, payload);
else console.log(payload);
